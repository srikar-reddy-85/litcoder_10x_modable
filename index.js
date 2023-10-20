const OpenAI = require('openai');
const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');

let openai;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to send a question to the ChatGPT API with retries for rate limiting
const sendQuestionToChatGPT = async (question, language) => {
    console.log("===============================" + language + "==========================================");
    console.log("Question extracted: " + question);
    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ "role": "user", "content": question + "no explanation or comments needed not even a single word except code i dont want explanation not even header and footer, just give only " + language + " code of this question?" }],
    });
    console.log(chatCompletion.choices[0].message.content);
    return chatCompletion.choices[0].message.content;
}

function formatFile(filePath) {
    // Read the content of the file
    const content = fs.readFileSync(filePath, 'utf8');

    // Split the content into lines
    const lines = content.split('\n');

    // Regex pattern to match and remove leading spaces before the code
    const pattern = /^(\s+)(?=\S)/;

    // Process each line and remove leading spaces
    const formattedLines = lines.map((line) => {
        const match = line.match(pattern);
        if (match) {
            return line.substring(match[0].length);
        }
        return line;
    });

    // Join the lines back together
    const formattedContent = formattedLines.join('\n');

    // Write the formatted content back to the file
    fs.writeFileSync(filePath, formattedContent, 'utf8');
}


const methodA = async (txtusername, txtpassword, apikey) => {
    openai = new OpenAI({
        apiKey: apikey,
    });
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    });

    try {
        const page = await browser.newPage();
        await page.goto('https://litcoder.azurewebsites.net');


        await page.type('#txtusername', txtusername);
        await page.type('#txtpassword', txtpassword);

        await page.waitForTimeout(1000);
        await page.click('.btn-primary');

        await page.waitForSelector('.card-group'); // Wait for the card group to load

        console.log("Select from below options: ");
        const cards = await page.$$('.card-title');
        const tableData = [];
        const row = [];
        let i = 1;

        for (const card of cards) {
            const innerText = await card.evaluate(node => node.textContent.trim());
            row.push(`[${i}]: ${innerText}`);
            i++;

            if (i % 2 === 1) {
                tableData.push(row.join('\t'));
                row.length = 0;
            }
        }

        // If there are remaining cards in the last row
        if (row.length > 0) {
            tableData.push(row.join('\t'));
        }

        // Display the table rows
        tableData.forEach(row => console.log(row));

        // Prompt the user to input the child element to click
        rl.question('Enter the child element number to click: ', async (childNumber) => {
            const view = await page.$(`.card-group .col-4:nth-child(${childNumber}) .btn-sm`);
            await view.click();
            await page.waitForTimeout(3000);
            const resume = await page.$('.col-8 .btn-sm');
            await resume.click();

            // Prompt the user to decide whether to click the "Next" button

            setTimeout(function () {
                rl.question('Do you want to click the "Next" button? (yes/no): ', async (answer) => {
                    if (answer.toLowerCase() === 'yes') {
                        await page.waitForTimeout(2000);
                        await page.click('#btnNext');
                    }

                    // Extract the question text
                    const questionElement = await page.$('.editor-preview-full');
                    const question = await questionElement.evaluate(node => node.innerText);
                    try {

                        // Format the 'code.txt' file
                        formatFile('code.txt');

                        //make it wait until the javacode.txt is finished writing 
                        //then perform below operations
                        await page.click('.ace_content');
                        await page.keyboard.down('Control');
                        await page.keyboard.press('A'); // Select all
                        await page.keyboard.up('Control');
                        await page.keyboard.press('Backspace'); // Delete selected text
                        await page.keyboard.press('Enter');

                        const textFileContent = fs.readFileSync('code.txt', 'utf8');
                        const lines = textFileContent.split('\n');

                        for (const line of lines) {
                            await page.keyboard.type(line);
                            await page.keyboard.press('Enter');
                            // await page.keyboard.press('Backspace');
                        }
                    } catch (error) {
                        console.error(error);
                    } finally {
                        // Close the browser when done
                        // await browser.close();
                        rl.close();
                    }
                })
                // Add your next line of code here
            }, 3000);


        });
    } catch (error) {
        console.error('Error with Puppeteer:', error);
    }

};

// Define method B
const methodB = async (txtusername, txtpassword, apikey) => {
    openai = new OpenAI({
        apiKey: apikey,
    });
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    });

    const page = await browser.newPage();
    await page.goto('https://litcoder.azurewebsites.net');

    await page.type('#txtusername', txtusername);
    await page.type('#txtpassword', txtpassword);
    await page.waitForTimeout(1000);
    await page.click('.btn-primary');

    await page.waitForSelector('.card-group'); // Wait for the card group to load

    const cards = await page.$$('.card-title');

    const arrays = [[7, 19, 31, 43, 55, 67, 79, 91], [8, 20, 32, 44, 56, 68, 80, 92], [9, 21, 33, 45, 57, 69, 81, 93], [10, 22, 34, 46, 58, 70, 82, 94], [11, 23, 35, 47, 59, 71, 83, 95], [12, 24, 36, 48, 60, 72, 84, 96],
    [13, 25, 37, 49, 61, 73, 85, 97], [14, 26, 38, 50, 62, 74, 86, 98], [15, 27, 39, 51, 63, 75, 87, 99], [16, 28, 40, 52, 64, 76, 88, 100], [17, 29, 41, 53, 65, 77, 89, 101], [18, 30, 42, 54, 66, 78, 90, 102]
    ]

    console.log('Select an array based on branch and language:');
    for (let i = 0; i < arrays.length; i++) {
        const branch = i < 6 ? 'CS' : 'Non CS';
        const language = ['Python', 'PHP', 'Java', 'JavaScript', 'C#', 'C++'][(i % 6)];
        console.log(`[${i}] For ${branch} - ${language} - ${arrays[i].join(', ')}`);
    }

    var language1;
    rl.question('Enter the index of the array you want to select: ', async (index) => {
        const index1 = parseInt(index);
        if (index1 === 0 || index1 === 6) {
            language1 = "python";
        } else if (index1 === 1 || index1 === 7) {
            language1 = "php";
        } else if (index1 === 2 || index1 === 8) {
            language1 = "java";
        } else if (index1 === 3 || index1 === 9) {
            language1 = "javascript";
        } else if (index1 === 4 || index1 === 10) {
            language1 = "c#";
        } else if (index1 === 5 || index1 === 11) {
            language1 = "c++";
        }
        const selectedArray = arrays[index];
        console.log('You selected the following array:');
        console.log(selectedArray);
        console.log('You selected the language:');
        console.log(language1);


        const childNumbers = selectedArray;

        for (const childNumber of childNumbers) {
            const view = await page.$(`.card-group .col-4:nth-child(${childNumber}) .btn-sm`);
            await view.click();
            await page.waitForTimeout(2000);
            const resume = await page.$('.col-8 .btn-sm');
            await resume.click();
            await page.waitForTimeout(4000);
            for (let questionNumber = 0; questionNumber < 2; questionNumber++) {
                fs.writeFileSync('code.txt', '', 'utf8');
                if (questionNumber === 1) {
                    await page.click('#btnNext');
                }
                // Extract the question text
                await page.waitForTimeout(6000);
                const questionElement = await page.$('.editor-preview-full');
                const question = await questionElement.evaluate(node => node.innerText);

                console.log("Question extracted: " + question);

                // Send the question to ChatGPT
                try {
                    const answergpt = await sendQuestionToChatGPT(question, language1);
                    console.log("Answer from ChatGPT: " + answergpt);

                    // Check if answergpt is not undefined before writing to a file
                    if (answergpt !== undefined) {
                        fs.writeFileSync('code.txt', answergpt, 'utf8');
                        console.log("Answer written to code.txt");

                        // Wait until the 'code.txt' file is fully written
                        await new Promise(resolve => {
                            fs.writeFile('code.txt', answergpt, 'utf8', (err) => {
                                if (err) throw err;
                                resolve();
                            });
                        });
                        // Format the 'code.txt' file
                        formatFile('code.txt');
                        // Make it wait until the 'code.txt' is finished writing 
                        await page.click('.ace_content');
                        await page.keyboard.down('Control');
                        await page.keyboard.press('A'); // Select all
                        await page.keyboard.up('Control');
                        await page.keyboard.press('Backspace'); // Delete selected text
                        await page.keyboard.press('Enter');

                        const textFileContent = fs.readFileSync('code.txt', 'utf8');
                        const lines = textFileContent.split('\n');

                        for (const line of lines) {
                            await page.keyboard.type(line);
                            await page.keyboard.press('Enter');
                            // await page.keyboard.press('Backspace');
                        }
                        await page.waitForTimeout(3000);
                        // await page.click('#btnSubmitCode')
                    } else {
                        console.error('ChatGPT response is undefined.');
                    }
                } catch (error) {
                    console.error('Error with ChatGPT:', error);
                }
            }
            await page.goBack();
            await page.goBack();
            await page.waitForTimeout(3000);

        }

        browser.close();
        rl.close();

    })

};


rl.question('Enter your OpenAI API key: ', async (apiKey) => {

    rl.question('Enter your #txtusername: ', async (txtusername) => {
        // Ask the user to input their #txtpassword
        rl.question('Enter your #txtpassword: ', async (txtpassword) => {
            // Now that you have the apiKey, txtusername, and txtpassword, you can call methodA or methodB.
            rl.question('If you want to insert your answer into a question, type "A". If you want ChatGPT to answer all questions, type "B": ', (method) => {
                if (method.toUpperCase() === 'A') {
                    methodA(txtusername, txtpassword, apiKey);
                } else if (method.toUpperCase() === 'B') {
                    methodB(txtusername, txtpassword, apiKey);
                } else {
                    console.log('Invalid method selection.');
                    rl.close();
                }
            });
        });
    });

});
