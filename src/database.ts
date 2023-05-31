import mongoose from 'mongoose';
mongoose.connect(`mongodb://127.0.0.1:27017/xbot?authSource=admin`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} as any).catch(error => { console.error(error) });

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB!');
});