require('dotenv').config();

const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();

const config = {
    user: "epiz_34044500",
    // Password optional, prompted if none given
    password: process.env.DEPLOY_FTP_PASSWORD,
    host: "ftpupload.net",
    port: 21,
    localRoot: __dirname + "/public",
    remoteRoot: "/htdocs/",
    include: ["*", "**/*"],      // this would upload everything except dot files
    // include: ["*.php", "dist/*", ".*"],
    // e.g. exclude sourcemaps, and ALL files in node_modules (including dot files)
    exclude: [
        "dist/**/*.map",
        "node_modules/**",
        "node_modules/**/.*",
        ".git/**",
    ],
    // delete ALL existing files at destination before uploading, if true
    deleteRemote: false,
    // Passive mode is forced (EPSV command is not sent)
    // forcePasv: true,
    // use sftp or ftp
    sftp: false,
};

console.log('Uploading to FTP...')
// ftpDeploy.on("log", console.log)
ftpDeploy.on("uploading", (data) => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(data.transferredFileCount + 1 + '/' + data.totalFilesCount + ' ' + data.filename)
});
ftpDeploy
    .deploy(config)
    .then((res) => console.log("All done!"))
    .catch((err) => console.log(err));