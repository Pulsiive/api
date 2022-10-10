class Site {
    //TODO: config
    static contactEmail = process.env.FROM_EMAIL || 'contact@pulsive.net';
    static resetPasswordEmail = 'resetpassword@pulsive.net';
    static doNotReplyEmail = 'donotreply@pulsive.net'
}

export default Site;
