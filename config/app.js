import { ENV } from './env';

export const isProduction = ENV === 'production';
export const isDebug = ENV === 'development';
export const isClient = typeof window !== 'undefined';

// // export const apiEndpoint = isDebug ? 'http://localhost:3000' : 'https://demo-reactgo.herokuapp.com';
// export const apiEndpoint = 'http://localhost:3000';
// // Replace with 'UA-########-#' or similar to enable tracking

export const config = {
    // mongoURL: process.env.MONGO_URL || 'mongodb://localhost:27017/discount_app',
    mongoURL: process.env.MONGO_URL || `mongodb+srv://adamasinnov:AdamasAdmin2023@adamasinnov.babhglt.mongodb.net/discount_app`,
    port: process.env.PORT || 5001,
    sslport: 5002,

    // bucket: 'aatv-assets',
    bucket: 'tieapp-assets',

    // url: "https://s3-ap-southeast-1.amazonaws.com/aatv-assets/",
    url: "https://tieapp-assets.s3.ap-southeast-1.amazonaws.com/",

    file_path: "/root/discount_app_admin/public/photos/",

    semaphore_otp_url: "https://semaphore.co/api/v4/messages",
    semaphore_apikey: "b027748929d186ecaef4e4d92e64a66d"
};
