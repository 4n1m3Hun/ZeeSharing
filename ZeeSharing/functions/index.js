/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");


import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

admin.initializeApp();

const corsHandler = cors({ origin: true });

export const getAudioFile = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    const filePath = 'music/1728764346852_teszt.mp3'; // Cseréld le a megfelelő fájl elérési útra
    const bucket = admin.storage().bucket();
    const file = bucket.file(filePath);

    res.set('Content-Type', 'audio/mp3');
    file.createReadStream().pipe(res);
  });
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
