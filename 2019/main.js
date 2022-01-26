const axios = require('axios');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const csv = require('csv-parser');
const fs = require('fs');


const getDLEAS = ()=> new Promise(resolve =>{
    let returnList = [];
    fs.createReadStream('./idlist.csv')
        .pipe(csv())
        .on('data', (row) => {
            returnList.push(row['District LEA']);
        })
        .on('end', () => {
            resolve(returnList);
        });
});
const getNLEAS = ()=> new Promise(resolve =>{
    let returnList = [];
    fs.createReadStream('./idlist.csv')
        .pipe(csv())
        .on('data', (row) => {
            returnList.push(row['NCES LEA ID']);
        })
        .on('end', () => {
            resolve(returnList);
        });
});
const getZip = ()=> new Promise(resolve =>{
    let returnList = [];
    fs.createReadStream('./idlist.csv')
        .pipe(csv())
        .on('data', (row) => {
            returnList.push(row['Mailing Address']);
        })
        .on('end', () => {
            resolve(returnList);
        });
});

getDLEAS().then(async (leas) => {
    getNLEAS().then(async (nleas) => {
        getZip().then(async (zips) => {
            let fData = [];
            try {
                for (let lea1 in leas) {
                    let lea = leas[lea1];
                    let nlea = nleas[lea1]
                    if (lea.length === 6) lea = 0+lea;
                    console.log(`Retrieving info for NCES School ID: ${nlea}, District ID: ${lea}`);
                    const browser = await puppeteer.launch();
                    const page = await browser.newPage();
                    let { data } = await axios.get('https://myschoolinfo.arkansas.gov/SRC/29/'+lea);
                    await page.goto('https://nces.ed.gov/Programs/Edge/ACSDashboard/0'+nlea);
                    const ecoData = await page.evaluate(async () => {
                        let data;
                        try {
                            data = {
                                community: {
                                    totalPop: document.querySelector('.row > .col-md-4 > .dataStack > .dataNumber').textContent.trim(),
                                    medianHouseIncome: document.querySelector('.row > .col-md-5 > .dataStack > .dataNumber').textContent.split("$").splice(0).join(" ").trim(),
                                    totalHouses: document.querySelector('.row > .col-md-3 > .dataStack > .dataNumber').textContent.trim(),
                                    race: {
                                        white: document.querySelector('.raceHeight > .GaugeMeter:nth-child(1)').textContent.split("%").shift().trim(),
                                        black: document.querySelector('.raceHeight > .GaugeMeter:nth-child(2)').textContent.split("%").shift().trim(),
                                        hispanic: document.querySelector('.raceHeight > .GaugeMeter:nth-child(3)').textContent.split("%").shift().trim(),
                                        asian: document.querySelector('.raceHeight > .GaugeMeter:nth-child(4)').textContent.split("%").shift().trim(),
                                        native: document.querySelector('.raceHeight > .GaugeMeter:nth-child(5)').textContent.split("%").shift().trim(),
                                        hawaiian: document.querySelector('.raceHeight > .GaugeMeter:nth-child(6)').textContent.split("%").shift().trim(),
                                        other: document.querySelector('.raceHeight > .GaugeMeter:nth-child(7)').textContent.split("%").shift().trim(),
                                        multi: document.querySelector('.raceHeight > .GaugeMeter:nth-child(8)').textContent.split("%").shift().trim()
                                    },
                                    yearHSB: {
                                        after2k: document.querySelector('span[ng-if="data.UnitApt >= 0"]').textContent.split("%").shift().trim(),
                                        b7099: document.querySelector('span[ng-if="data.Built19702000 >= 0"]').textContent.split("%").shift().trim(),
                                        before70: document.querySelector('span[ng-if="data.BuiltPrior1970 >= 0"]').textContent.split("%").shift().trim()
                                    },
                                    housingType: {
                                        house: document.querySelector('span[ng-if="data.UnitHouse >= 0"]').textContent.split("%").shift().trim(),
                                        other: document.querySelector('span[ng-if="data.UnitApt >= 0"]').textContent.split("%").shift().trim()
                                    }
                                },
                                childrenInSchool: {
                                    health: {
                                        disability: document.querySelector('span[ng-if="data.Under18Disability >= 0"]').textContent.split("%").shift().trim(),
                                        insuranceCov: document.querySelector('span[ng-if="data.Under18HealthCare >= 0"]').textContent.split("%").shift().trim()
                                    },
                                    povAndBen: {
                                        belowPov: document.querySelector('span[ng-if="data.BelowPoverty >= 0"]').textContent.split("%").shift().trim(),
                                        foodStamp: document.querySelector('span[ng-if="data.FoodStamps >= 0"]').textContent.split("%").shift().trim()
                                    },
                                    hhByType: {
                                        married: document.querySelector('div[ng-if="data.MarriedCoupleHouseholder >= 0"] > span').textContent.split("%").shift().trim(),
                                        female: document.querySelector('div[ng-if="data.FemaleOnlyHouseholder >= 0"] > span').textContent.split("%").shift().trim(),
                                        male: document.querySelector('div[ng-if="data.MaleOnlyHouseholder >= 0"] > span').textContent.split("%").shift().trim()
                                    }
                                },
                            };
                        } catch(err){
                            if(err){
                                try {
                                    data = {
                                        community: {
                                            totalPop: document.querySelector('.row > .col-md-4 > .dataStack > .dataNumber').textContent.trim(),
                                            medianHouseIncome: document.querySelector('.row > .col-md-5 > .dataStack > .dataNumber').textContent.split("$").splice(0).join(" ").trim(),
                                            totalHouses: document.querySelector('.row > .col-md-3 > .dataStack > .dataNumber').textContent.trim(),
                                            race: {
                                                white: document.querySelector('.raceHeight > .GaugeMeter:nth-child(1)').textContent.split("%").shift().trim(),
                                                black: document.querySelector('.raceHeight > .GaugeMeter:nth-child(2)').textContent.split("%").shift().trim(),
                                                hispanic: document.querySelector('.raceHeight > .GaugeMeter:nth-child(3)').textContent.split("%").shift().trim(),
                                                asian: document.querySelector('.raceHeight > .GaugeMeter:nth-child(4)').textContent.split("%").shift().trim(),
                                                native: document.querySelector('.raceHeight > .GaugeMeter:nth-child(5)').textContent.split("%").shift().trim(),
                                                hawaiian: document.querySelector('.raceHeight > .GaugeMeter:nth-child(6)').textContent.split("%").shift().trim(),
                                                other: document.querySelector('.raceHeight > .GaugeMeter:nth-child(7)').textContent.split("%").shift().trim(),
                                                multi: document.querySelector('.raceHeight > .GaugeMeter:nth-child(8)').textContent.split("%").shift().trim()
                                            },
                                            yearHSB: {
                                                after2k: document.querySelector('span[ng-if="data.UnitApt >= 0"]').textContent.split("%").shift().trim(),
                                                b7099: document.querySelector('span[ng-if="data.Built19702000 >= 0"]').textContent.split("%").shift().trim(),
                                                before70: document.querySelector('span[ng-if="data.BuiltPrior1970 >= 0"]').textContent.split("%").shift().trim()
                                            },
                                            housingType: {
                                                house: document.querySelector('span[ng-if="data.UnitHouse >= 0"]').textContent.split("%").shift().trim(),
                                                other: document.querySelector('span[ng-if="data.UnitApt >= 0"]').textContent.split("%").shift().trim()
                                            }
                                        },
                                        childrenInSchool: "N/A"
                                    };
                                }catch(err){
                                    if(err){
                                        data = {
                                            community: "N/A",
                                            childrenInSchool: "N/A"
                                        };
                                    };
                                };
                            };
                        };
                        return data;
                    });
                    let $ = cheerio.load(data);
                    let bigData = {
                        lea: lea,
                        name: $('.hdr h2').text(),
                        zip: zips[lea1].split(" ").pop(),
                        community: ecoData.community,
                        childrenInSchool: ecoData.childrenInSchool,
                        act: {
                            composite: $('tr:nth-of-type(11) td.noborder-top:nth-of-type(2)').text(),
                            reading: $('tr:nth-of-type(7) td.noborder-top:nth-of-type(2)').text(),
                            english: $('tr:nth-of-type(8) td.noborder-top:nth-of-type(2)').text(),
                            math: $('tr:nth-of-type(9) td.noborder-top:nth-of-type(2)').text(),
                            science: $('tr:nth-of-type(10) td.noborder-top:nth-of-type(2)').text()
                        },
                        demographic: {
                            other: {
                                englishLearners: $('div.title:nth-of-type(1) div.pct-holder').text().split('%').join('').trim(),
                                lowIncome: $('div.title:nth-of-type(2) div.pct-holder').text().split('%').join('').trim(),
                                sped: $('div.row:nth-of-type(3) div.pct-holder').text().split('%').join('').trim()
                            }
                        },
                        disChar: {
                            enrollment: $('.col-xs-4 span span').text().split(',').join(''),
                            avgClassSize: $('div.row:nth-of-type(2) span span').text(),
                            avgTeachExpYrs: $('div.row:nth-of-type(3) .col-md-3 span span').text(),
                            perPupSpend: $('div.row:nth-of-type(5) span span').text().split('$').join('').split(',').join(''),
                        },
                        schoolEnviroment: {
                            expulsions: $('div:nth-of-type(10) .print-50 tr:nth-of-type(6) td:nth-of-type(2)').text() || '0',
                            weaponInc: $('div:nth-of-type(10) .print-50 tr:nth-of-type(7) td:nth-of-type(2)').text() || '0',
                            staffAssaults: $('div:nth-of-type(10) .print-50 tr:nth-of-type(8) td:nth-of-type(2)').text() || '0',
                            studentAssaults: $('div:nth-of-type(10) .print-50 tr:nth-of-type(9) td:nth-of-type(2)').text() || '0',
                            refLeo: $('div:nth-of-type(10) .print-50 tr:nth-of-type(10) td:nth-of-type(2)').text() || '0',
                            schoolArrests: $('div:nth-of-type(10) .print-50 tr:nth-of-type(11) td:nth-of-type(2)').text() || '0'
                        },
                        schoolPerformance: {
                            attendance: $('.report-card-section-table.print-50 tr:nth-of-type(16) td.src-data-value:nth-of-type(2)').text().split('%').join('').trim(),
                            dropout: $('.print-50 tr:nth-of-type(35) td.src-data-value:nth-of-type(2)').text().split('%').join('').trim(),
                            a: $('.print-50 tr:nth-of-type(4) td.src-data-value:nth-of-type(2) span span').text(),
                            b: $('.print-50 tr:nth-of-type(5) td.src-data-value:nth-of-type(2) span span').text(),
                            c: $('.print-50 tr:nth-of-type(6) td.src-data-value:nth-of-type(2) span span').text(),
                            d: $('.print-50 tr:nth-of-type(7) td.src-data-value:nth-of-type(2) span span').text(),
                            f: $('.print-50 tr:nth-of-type(8) td.src-data-value:nth-of-type(2) span span').text(),
                        },
                        teacherQuality: {
                            certified: $('.print-66 tr:nth-of-type(2) td.src-data-value:nth-of-type(2)').text().split('%').join('').trim(),
                            bachelors: $('.page-wrapper .print-66 tr:nth-of-type(3) td.src-data-value:nth-of-type(2)').text().split('%').join('').trim(),
                            masters: $('.print-66 tbody:nth-of-type(2) tr:nth-of-type(4) td.src-data-value:nth-of-type(2)').text().split('%').join('').trim(),
                            advanced: $('.print-66 tbody:nth-of-type(2) tr:nth-of-type(5) td.src-data-value:nth-of-type(2)').text().split('%').join('').trim()
                        },
                    };
                    browser.close();
                    fs.readFile('./data.json', function(err, data){
                        let da = JSON.parse(data);
                        da.push(bigData);
                        fs.writeFile('./data.json', JSON.stringify(da), function(err){
                            if(err) return console.log(err);
                        })
                    })
                }
            } catch(err){
                if(err){
                    console.log(err);
                    process.exit(1)
                }
            }
        });
    });
});