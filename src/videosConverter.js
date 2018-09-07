/**
 *             videosConverter
 *
 * @version    0.1.1
 * @date       2018-08-24
 *
 * @author     Alexandre Bonneau
 * @summary    Converts videos made by your phone into x265 ones
 * @link       https://gitlab.com/AnotherLinuxUser/videosConverter
 *
 * @license    Released under the GPLv3 License
 *
 *
 * Converts all the files given as a parameter (or the mp4 files inside
 * the directory given as a parameter), to the x265 format.
 * Move those x265 videos into a folder names 'x265', and rename the
 * files with `_x265` at the end of their name.
 *
 *
 * Copyright © 2018 Alexandre Bonneau <alexandre.bonneau@linuxfr.eu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

const fs            = require('fs');
const { spawnSync } = require('child_process');

/* global process */
/* eslint no-console: 0 */

// ffmpeg configuration
/*
 * The range of the CRF scale is 0–51, where 0 is lossless, 23 is the default, and 51 is worst quality possible.
 * A lower value generally leads to higher quality, and a subjectively sane range is 17–28. Consider 17 or 18 to
 * be visually lossless or nearly so; it should look the same or nearly the same as the input but it isn't
 * technically lossless.
 * The range is exponential, so increasing the CRF value +6 results in roughly half the bitrate / file size,
 * while -6 leads to roughly twice the bitrate.
 */
//TODO Add the following variables as cmdline parameters
const constantRateFactor = 23; // 28
const audioCodec         = 'aac';
const presetSpeed        = 'slow'; // ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow, placebo

// Script configuration
const defaultOutputDirName    = 'x265';
const defaultFilenameAddition = '_x265';

// Check the arguments
if (process.argv.length === 2 || process.argv.length > 4) {
    console.error(`An invalid number of arguments has been passed (${process.argv.length - 2}). Aborting.`);
    showUsage();
    process.exit(1);
}

// Retrieve the folder name to parse for videos to convert
const [nodePath, scriptPath, filesOrFolders, outputDir] = process.argv;
const targetFolder                                      = `./${filesOrFolders}/`;
const outputDirName                                     = selectOutputDir(outputDir, defaultOutputDirName);
console.log(`Listing and converting all the video files in the '${filesOrFolders}' directory...`);

// Prepare the output folder
createOutputFolder(outputDirName); //TODO First check that there are at least one file to be converted before creating the output folder

// Convert all the video files
const globalStartTime = process.hrtime();
let videoCount        = 0;
let conversionCount   = 0;
const filesArray      = fs.readdirSync(targetFolder);

filesArray.forEach(fileName => {
    // Test if the given file is a video
    if (isVideo(fileName)) {
        videoCount++;
        const targetFilename = generateTargetFilename(fileName, defaultFilenameAddition);

        // Before converting the video file, check that it does not already exists in the output folder. If it does, output a notice.
        if (fs.existsSync(`${outputDirName}/${targetFilename}`)) {
            // Get the video informations
            const stats = fs.statSync(`${outputDirName}/${targetFilename}`);
            console.log(`${videoCount}: The file ${outputDirName}/${targetFilename} (${convertBytesToMegaBytes(stats['size'])}Mio) already exists!`);
        } else {
            // Convert the video file
            conversionCount++;
            const conversionStartTime = process.hrtime();

            // Run the command line synchronously
            spawnSync('ffmpeg', ['-i', fileName, '-c:v', 'libx265', '-crf', constantRateFactor, '-c:a', audioCodec, '-b:a', '128k', '-preset', presetSpeed, `${outputDirName}/${targetFilename}`]);

            // Get the video informations
            const statsOriginal  = fs.statSync(fileName);
            const sizeOriginal   = convertBytesToMegaBytes(statsOriginal['size']);
            const statsGenerated = fs.statSync(`${outputDirName}/${targetFilename}`);
            const sizeGenerated  = convertBytesToMegaBytes(statsGenerated['size']);
            const ratioSize      = ((sizeGenerated / sizeOriginal) * 100).toFixed(2);

            // Display the informations about the generated file
            console.log(`${videoCount}: ${outputDirName}/${targetFilename} (${sizeOriginal}Mio -> ${sizeGenerated}Mio, ${ratioSize}%) generated in ${parseHrtimeToSeconds(process.hrtime(conversionStartTime))} seconds.`);
        }
    }
});

// Display the statistics
if (conversionCount === 0) {
    if (videoCount === 0) {
        console.log(`No video files were converted. None were found.`);
    } else {
        console.log(`No new video files were converted. The ${videoCount} existing ones were already converted.`);
    }
} else {
    console.log(`${conversionCount} videos converted in ${parseHrtimeToSeconds(process.hrtime(globalStartTime))} seconds.`); //TODO pluralize that string
    console.log(`Command line used: \`ffmpeg -i <fileName> -c:v libx265 -crf ${constantRateFactor} -c:a ${audioCodec} -b:a 128k ${outputDirName}/<targetFilename>\``);
}

// End of the script
process.exit(0);


// ------------------------------------------------------
// ------------------ Functions

function convertBytesToMegaBytes(bytes) {
    return (bytes / 1024 / 1024).toFixed(2);
}

function parseHrtimeToSeconds(hrtime) {
    return (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
}

function selectOutputDir(outputDir, defaultOutputDirName) {
    if (outputDir !== null && outputDir !== '' && outputDir !== void(0)) {
        return outputDir;
    }

    return defaultOutputDirName;
}

function generateTargetFilename(filename, filenameAddition) {
    return String(filename).replace('.mp4', `${filenameAddition}.mp4`);
}

function isVideo(filename) {
    //TODO Use better heuristics to check if the file is a video
    return /\.mp4$/.test(String(filename));
}

function createOutputFolder(dirname) {
    //TODO Test if the output folder already exists
    mkdirSync(dirname);
}

function mkdirSync(dirPath) {
    try {
        fs.mkdirSync(dirPath);
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

function showUsage() {
    console.log(`Usage: nodejs videosConverter.js <folderContainingTheVideosToConvert> [<outputDir>]`);
}

