import dotenv from 'dotenv';
import express, {json, urlencoded, static as static_} from "express";
import { createServer } from 'http';
import authenticationRouter from "./routes/authentication.routes.js";
import productRouter from "./routes/product.routes.js";
import vendorRouter from "./routes/vendor.routes.js";
import warrantyRouter from "./routes/warranty.routes.js";
import claimsRouter from "./routes/claims.routes.js";
import userRouter from "./routes/user.routes.js";
import ocrRouter from "./routes/ocr.routes.js";
import categoryRouter from "./routes/category.routes.js";
import brandRouter from "./routes/brand.routes.js";
import logRouter from "./routes/log.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import cors from "cors";
import passport from "passport";
import {Strategy} from 'passport-google-oauth20';
import WarrantyWebSocket from './servers/ws_server/websocket.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize WebSocket server
const warrantyWebSocket = new WarrantyWebSocket(server);

// Make WebSocket instance available to routes
app.set('warrantyWebSocket', warrantyWebSocket);

app.use(cors({
    origin: '*',
    methods: ['GET','POST','PUT',"DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(passport.initialize());

app.use(json());
app.use(urlencoded({extended: true}));

passport.use(new Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CLIENT_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

app.use(static_("public"));
app.use("/api/auth", authenticationRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/vendors", vendorRouter);
app.use("/api/warranty", warrantyRouter);
app.use("/api/claims", claimsRouter);
app.use("/api/ocr", ocrRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/brands", brandRouter);
app.use("/api/logs", logRouter);

// WebSocket status endpoint
app.get("/api/websocket/status", (req, res) => {
    res.status(200).send({
        status: "WebSocket Server Running",
        connections: warrantyWebSocket.getConnectionCount(),
        timestamp: new Date().toISOString()
    });
});

app.all("*", (req, res) => {
    res.status(404).send({
        status: false,
        message: "No resource found. Check the URL."
    });
});

server.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
    console.log(`WebSocket server running on ws://localhost:${process.env.PORT}/api/warranty/ws`);
});

export { warrantyWebSocket };


// import dotenv from 'dotenv';
// import express, {json, urlencoded, static as static_} from "express";
// import authenticationRouter from "./routes/authentication.routes.js";
// import productRouter from "./routes/product.routes.js";
// import vendorRouter from "./routes/vendor.routes.js";
// import warrantyRouter from "./routes/warranty.routes.js";
// import claimsRouter from "./routes/claims.routes.js";
// import userRouter from "./routes/user.routes.js";
// import ocrRouter from "./routes/ocr.routes.js";
// import categoryRouter from "./routes/category.routes.js";
// import brandRouter from "./routes/brand.routes.js";
// import logRouter from "./routes/log.routes.js";
// import dashboardRouter from "./routes/dashboard.routes.js";
// import cors from "cors";
// import passport from "passport";
// import {Strategy} from 'passport-google-oauth20';

// dotenv.config();



// const app = express();

// app.use(cors({
//     origin: '*',
//     methods: ['GET','POST','PUT',"DELETE"],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(passport.initialize());

// app.use(json());
// app.use(urlencoded({extended: true}));

// passport.use(new Strategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: process.env.GOOGLE_CLIENT_CALLBACK_URL,
// }, (accessToken, refreshToken, profile, done) => {
//     return done(null, profile);
// }));

// app.use(static_("public"));
// app.use("/api/auth", authenticationRouter);
// app.use("/api/dashboard", dashboardRouter);
// app.use("/api/users", userRouter);
// app.use("/api/products", productRouter);

// app.use("/api/vendors", vendorRouter);
// app.use("/api/warranty", warrantyRouter);
// app.use("/api/claims", claimsRouter);
// app.use("/api/ocr", ocrRouter);
// app.use("/api/categories", categoryRouter);
// app.use("/api/brands", brandRouter);
// app.use("/api/logs", logRouter);

// app.all("*", (req, res) => {
//     res.status(404).send({
//         status: false,
//         message: "No resource found. Check the URL."
//     });
// });

// app.listen(process.env.PORT, () => {
//     console.log(`Listening on port ${process.env.PORT}`);
// });