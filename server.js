const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Filter = require('bad-words');
const natural = require('natural');
const stringSimilarity = require('string-similarity');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoose = require('mongoose');


const app = express();
const PORT = process.env.PORT || 9553;
const filter = new Filter();

// Add custom bad words if needed
filter.addWords('sex', 'porn', 'nude', 'nsfw');

// Security Middleware (Helmet + Rate Limiting)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://unpkg.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"]
        }
    }
}));
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
    message: { error: 'Too many requests from this IP, please try again later. (Spam Protection)' }
});

// Express Middleware
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Apply rate limiter specifically to suggestion posting
app.use('/api/suggestions', apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(__dirname)); // Serve frontend files

// Setup Directories
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// =====================================
// MongoDB Connection & Schema
// =====================================
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dtsr_database';
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

const suggestionSchema = new mongoose.Schema({
    id: String,
    name: String,
    category: String,
    text: String,
    image_url: String,
    sentiment: String,
    status: { type: String, default: 'Submitted' },
    date: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    reactions: {
        type: Map,
        of: Number,
        default: { "👍": 0, "❤️": 0, "😂": 0, "💡": 0 }
    },
    replies: [{
        id: String,
        name: String,
        text: String,
        date: { type: Date, default: Date.now }
    }]
});

const Suggestion = mongoose.model('Suggestion', suggestionSchema);

// Setup Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// AI Moderation API Check
async function checkImageSafety(imagePath) {
    try {
        // Placeholder for real image moderation API
        return true;
    } catch (e) {
        console.error("Moderation failed", e);
        return false;
    }
}

// =====================================
// AI Intelligence & Logic Helpers
// =====================================
const Analyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;
const analyzer = new Analyzer("English", stemmer, "afinn");
const tokenizer = new natural.WordTokenizer();

function getSentiment(text) {
    const words = tokenizer.tokenize(text);
    const score = analyzer.getSentiment(words);

    // Scale the AFINN score to Positive/Neutral/Negative
    if (score > 0.2) return 'Positive';
    if (score < -0.2) return 'Negative';
    return 'Neutral';
}

function autoCategorize(text) {
    const t = text.toLowerCase();
    if (t.includes('bug') || t.includes('broken') || t.includes('error') || t.includes('fail') || t.includes('fix')) {
        return 'Bug Report';
    }
    if (t.includes('add') || t.includes('want') || t.includes('need') || t.includes('feature') || t.includes('new')) {
        return 'Feature Request';
    }
    if (t.includes('safe') || t.includes('danger') || t.includes('harm') || t.includes('secure')) {
        return 'Safety Issue';
    }
    if (t.includes('complain') || t.includes('bad') || t.includes('terrible') || t.includes('hate')) {
        return 'Complaint';
    }
    // Default fallback
    return 'General';
}

// Routes
app.get('/api/suggestions', async (req, res) => {
    try {
        let suggestions = await Suggestion.find();
        
        // Sort by total reactions (descending), then by date (descending)
        suggestions.sort((a, b) => {
            const totalReactions = (entry) => {
                if (!entry.reactions) return entry.likes || 0;
                // Convert Map to object values for summation
                const reactionsObj = Object.fromEntries(entry.reactions);
                return Object.values(reactionsObj).reduce((sum, count) => sum + count, 0);
            };
            const rA = totalReactions(a);
            const rB = totalReactions(b);

            if (rB !== rA) {
                return rB - rA;
            }
            return new Date(b.date) - new Date(a.date);
        });
        res.json(suggestions);
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/suggestions', upload.single('image'), async (req, res) => {
    try {
        let { name, category, text, userIdentifier } = req.body;
        const id = Date.now().toString();
        const date = new Date().toISOString();
        let image_url = null;

        // ----------------------------------------
        // 2. Text Content Moderation
        // ----------------------------------------
        const sanitizeForFilter = (str) => {
            if (!str) return "";
            return str.replace(/[^\w\s]/gi, '').toLowerCase();
        };

        const cleanText = sanitizeForFilter(text);
        const cleanName = sanitizeForFilter(name);

        if (filter.isProfane(text) || filter.isProfane(cleanText) ||
            (name && (filter.isProfane(name) || filter.isProfane(cleanName)))) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ error: 'Suggestion rejected: Inappropriate language detected. (Profanity Filter)' });
        }

        // ----------------------------------------
        // 3. Image Safety Moderation
        // ----------------------------------------
        if (req.file) {
            const isSafe = await checkImageSafety(req.file.path);
            if (!isSafe) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ error: 'Image rejected: Adult content detected.' });
            }
            image_url = '/uploads/' + req.file.filename;
        }

        // ----------------------------------------
        // 4. Auto-Categorization & Sentiment Analysis 
        // ----------------------------------------
        if (!category || category === 'General') {
            category = autoCategorize(text);
        }
        const sentimentScore = getSentiment(text);

        // ----------------------------------------
        // Save to Database
        // ----------------------------------------
        const newEntry = new Suggestion({
            id,
            name: name || 'Anonymous',
            userIdentifier: userIdentifier || 'Anonymous',
            category,
            text,
            image_url,
            sentiment: sentimentScore,
            status: 'Submitted',
            date,
            reactions: { "👍": 0, "❤️": 0, "😂": 0, "💡": 0 },
            replies: []
        });
        await newEntry.save();

        // ----------------------------------------
        // Send Response
        // ----------------------------------------
        res.status(201).json({ success: true, ...newEntry.toObject() });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/suggestions/:id', async (req, res) => {
    const id = req.params.id;
    console.log("DELETE REQUEST RECEIVED FOR ID:", id);

    try {
        const row = await Suggestion.findOne({ id: id });
        if (!row) {
            console.log("ERROR: ID NOT FOUND IN DB:", id);
            return res.status(404).json({ error: 'Suggestion not found' });
        }

        if (row.image_url) {
            const filename = row.image_url.split('/').pop();
            const imgPath = path.join(__dirname, 'uploads', filename);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }

        await Suggestion.deleteOne({ id: id });
        console.log("DELETE SUCCESSFUL");
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/suggestions/:id/reaction', async (req, res) => {
    const id = req.params.id;
    const { emoji, action } = req.body; // action: 'add' or 'remove'

    try {
        const suggestion = await Suggestion.findOne({ id: id });

        if (suggestion) {
            // Map handling in Mongoose
            let count = suggestion.reactions.get(emoji) || 0;
            if (action === 'add') {
                suggestion.reactions.set(emoji, count + 1);
            } else if (action === 'remove' && count > 0) {
                suggestion.reactions.set(emoji, count - 1);
            }

            // Keep legacy likes field in sync if it's the thumbs up
            if (emoji === '👍') {
                suggestion.likes = suggestion.reactions.get('👍');
            }

            await suggestion.save();
            res.json({ success: true, reactions: Object.fromEntries(suggestion.reactions) });
        } else {
            res.status(404).json({ error: 'Suggestion not found' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/suggestions/:id/reply', async (req, res) => {
    const { id } = req.params;
    let { name, text } = req.body;

    try {
        const suggestion = await Suggestion.findOne({ id: id });
        if (!suggestion) return res.status(404).json({ error: 'Not found' });

        // Basic moderation for replies
        const sanitizeForFilter = (str) => {
            if (!str) return "";
            return str.replace(/[^\w\s]/gi, '').toLowerCase();
        };
        const cleanText = sanitizeForFilter(text);
        if (filter.isProfane(text) || filter.isProfane(cleanText)) {
            return res.status(400).json({ error: 'Reply rejected: Inappropriate language.' });
        }

        suggestion.replies.push({
            id: Date.now().toString(),
            name: name || 'Anonymous',
            text: text,
            date: new Date().toISOString()
        });

        await suggestion.save();
        res.json(suggestion);
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Graceful shutdown
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

async function shutdown(signal) {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
