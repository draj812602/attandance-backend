const admin = require("firebase-admin");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDW29YaOfM6xu8R\nEQAVptrkH5kdOnGOkCwuOT6r19t4L1YJC08zd7WGybnXmwDWQd4FvKKvqBFnkoJ3\nXRvQFvzxowH1MDByJ/8diN6dRs7mkHBBTSc6CX8kEx4AHZsj4av+p+MTXg1nOYhm\nwVQ1E2oIIZ9oBUGGiC4odeQmw8lNHy1cIIFy0/49V2HAjZ2+Mx21bdPCZrOci46L\ncX82cOy0xbsZbqAsM8Vj8VbLMgBTdb5mDN+6P9kuv9Ph/VVZKi5i/XD3pQ8r81F2\nkAKUKtOBp6CcAjyhAUuNjVND4Z5O28n8Pu46D62T1SJ4EDjHXUXtugE1uxtDnqB9\nQWnRXXvPAgMBAAECggEAJEmPoPFNm40ynirFXWLHUETn6rBOsnm2BH6Fj6dOuT8h\nZDilQTeEEIYsXXYfz4/jTAu+XDVh7yCm6Trv8haX1MWnlH31iKopo5bUpjJpyjX1\nx4mcyOgGsZSK+hEF/SrljgZTyxcU42yrlVMsgiRLwaDQF9TfarXAOfQjOsrRSjVd\nCiqqREyrL+QQdKHcv/XIT+1ZSq+UXRitluZJTPz5VbasRwM0r0YPLpRs93FSivzh\nfKcYnvExBKKIOTaQS4bGKJ2ZyA7iE4idjETXqeHk9GjRqnQdNse7h8Rg70vKD3RX\nKk62omCY0B/rfHRdmA/MGgxjR/fGlpFecNqq8dlCwQKBgQDvsvRFZuDUU2nfJzia\npsAiDSdYq7PcxiiVAmLhZhmQjdsa40CP1X+M9UqFYPmMyrtO/K9muryd7Qv2CCO1\nhy43yIWiUcKixnD0AnQsL71mS+pS/b/u73OPhpCSgy5BkiPCIk8aqc4wax/dQEfL\n9AaHaPnLw8YMXZzIoHYkEwEpDwKBgQDleGygW05Qcd9Y7ZUjnVodBvXiQOBypsN/\nga6R5W2jEmO9TaIA4KwvKn0mjgFnxBb/MLuK1FXvUU0/csslQlp5dOC7oez3jWDx\nM81LQaP6ujbdq0Mtsoym3VK0wafBRaGplj3u8h6bPow512utipQW3LiXgKpxl50M\nUyQdSocBQQKBgQCCPRDeeMSmeWAoIO5vkTUKC22aj0jeJ0k7lZ1WbRxs37bySBH3\nVQDF/S1thUBykGDvzPoc7k+322nJV6jXZEjnhGufw57mxL3wxziKHbJiV9NNHpTf\n5Xk7vdjl0qMae6Y0QGIM0cC3rC0XEWsxVTkK8C3x2kDMzTx4Aj/O4AicXwKBgCkv\n0zd5C/Zuaes5QYKR9KGvJSUGBgMuIXraWO4A4wvY+iP5MjG8IcuZcbsg0+m/DW2i\nXpcNg5sf2aCgxwuZ/Ek+jDPBXZoVOygv5xIx5u/SypRA8B7cpFgy82xUMfsDt3+L\n4vPna0zsDhk3rDEK5Yew+EThKDaZQuv6ZEoJnW/BAoGAM765mo95PBkL+XOBpk7p\nW0XnrNtIac4HJ+ilp/ywJjRwJrn+Hs6kq0QXFkBABkLXUhoSn3X0lI1LnnIh36oL\n9VMYxg/Em19AglhJGD9w+sbgpc8yrwoQaGjZfbxp4dZXJMgyQIahwkHXq4/pL+Ob\nOgr0cu0t44Fnz2vj1Qs0yYs=\n-----END PRIVATE KEY-----\n",
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;
