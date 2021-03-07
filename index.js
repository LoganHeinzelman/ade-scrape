const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('csv-parser');
const chalk = require('chalk');
const log = console.log;

const getDLEAS = () => new Promise(resolve =>{
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
const getNLEAS = () => new Promise(resolve =>{
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


(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox']});
    const page = await browser.newPage();
    getDLEAS().then(async (leas) => {
        getNLEAS().then(async (nleas) => {
            getZip().then(async (zips) => {
                for (let lea1 in leas) {
                    let lea = leas[lea1];
                    let nlea = nleas[lea1];
                    if (lea.length === 6) lea = 0+lea;
                    log(chalk.blue(`Retrieving info for NCES School ID: ${nlea}, District ID: ${lea}`));
                    await page.goto('https://nces.ed.gov/Programs/Edge/ACSDashboard/'+nlea, {
                        waitUntil: 'networkidle0',
                    });
                    let ecoData = await page.evaluate(async () => {
                        return {
                            community:{
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
                                    after2k: document.querySelector('span[ng-if="data.Built2000Up >= 0"]').textContent.split("%").shift().trim(),
                                    b7099: document.querySelector('span[ng-if="data.Built19702000 >= 0"]').textContent.split("%").shift().trim(),
                                    before70: document.querySelector('span[ng-if="data.BuiltPrior1970 >= 0"]').textContent.split("%").shift().trim()
                                },
                                broadband: document.querySelector('.col-md-12 span.dataNumber').textContent.split("%").shift().trim(),
                                housingType: {
                                    house: document.querySelector('span[ng-if="data.UnitHouse >= 0"]').textContent.split("%").shift().trim(),
                                    other: document.querySelector('span[ng-if="data.UnitApt >= 0"]').textContent.split("%").shift().trim()
                                }
                            },
                            children: {
                                health: {
                                    disability: (document.querySelector('span[ng-if="data.Under18Disability >= 0"]') === null) ? "null" : document.querySelector('span[ng-if="data.Under18Disability >= 0"]').textContent.split("%").shift().trim(),
                                    insuranceCov: (document.querySelector('span[ng-if="data.Under18HealthCare >= 0"]') === null) ? "null" : document.querySelector('span[ng-if="data.Under18HealthCare >= 0"]').textContent.split("%").shift().trim()
                                },
                                povAndBen: {
                                    belowPov: (document.querySelector('span[ng-if="data.BelowPoverty >= 0"]') === null) ? "null" : document.querySelector('span[ng-if="data.BelowPoverty >= 0"]').textContent.split("%").shift().trim(),
                                    foodStamp: (document.querySelector('span[ng-if="data.FoodStamps >= 0"]') === null) ? "null" : document.querySelector('span[ng-if="data.FoodStamps >= 0"]').textContent.split("%").shift().trim()
                                },
                                hhByType: {
                                    married: (document.querySelector('div[ng-if="data.MarriedCoupleHouseholder >= 0"] > span') === null) ? "null" : document.querySelector('div[ng-if="data.MarriedCoupleHouseholder >= 0"] > span').textContent.split("%").shift().trim(),
                                    female: (document.querySelector('div[ng-if="data.FemaleOnlyHouseholder >= 0"] > span') === null) ? "null" : document.querySelector('div[ng-if="data.FemaleOnlyHouseholder >= 0"] > span').textContent.split("%").shift().trim(),
                                    male: (document.querySelector('div[ng-if="data.MaleOnlyHouseholder >= 0"] > span') === null) ? "null" : document.querySelector('div[ng-if="data.MaleOnlyHouseholder >= 0"] > span').textContent.split("%").shift().trim()
                                }
                            },
                            parents: {
                                medianIncome: (document.querySelector('.col-md-5 > span.dataNumber') === null) ? "null" : document.querySelector('.col-md-5 > span.dataNumber').textContent.split("$").splice(0).join(" ").trim(),
                                housingStatus: {
                                    rented: (document.querySelector('.col-md-7 .dataStack span:nth-of-type(2)') === null) ? "null" : document.querySelector('.col-md-7 .dataStack span:nth-of-type(2)').textContent.split("%").shift().trim(),
                                    owned: (document.querySelector('.dataStack span:nth-of-type(3)') === null) ? "null" : document.querySelector('.dataStack span:nth-of-type(3)').textContent.split("%").shift().trim()
                                },
                                employment: {
                                    employed: (document.querySelector('#laborChart [text-anchor="start"] tspan') === null) ? "null" : document.querySelector('#laborChart [text-anchor="start"] tspan').textContent.split(" ").slice(-1)[0].split("%").shift().trim(),
                                    unemployed: (document.querySelector('#laborChart [text-anchor="end"] tspan') === null) ? "null" : document.querySelector('#laborChart [text-anchor="end"] tspan').textContent.split(" ").slice(-1)[0].split("%").shift().trim()
                                }
                            }
                        };
                    });
                    await page.goto('https://myschoolinfo.arkansas.gov/SRC/30/'+lea);
                    let schData = await page.evaluate(async () => {
                        return {
                            name: document.querySelector('.hdr h2').textContent.trim(),
                            disChar: {
                                enrollment: document.querySelector('.col-xs-4 span.FY-30').textContent.trim().split(',').join(''),
                                avgClassSize: document.querySelector('div.row:nth-of-type(2) .col-md-3 span.FY-30').textContent.trim(),
                                avgTeachExpYrs: document.querySelector('div.row-rc:nth-of-type(3) span.FY-30').textContent.trim(),
                                perPupSpending: document.querySelector('div.row:nth-of-type(5) span.FY-30').textContent.trim().split('$').join('').split(',').join(''),

                            },
                            demographic:{
                                studentRace: {
                                    native: document.querySelector('.highcharts-color-0 tspan').textContent.split(" ").shift().split("%").shift().trim(),
                                    asian: document.querySelector('.highcharts-color-1 tspan').textContent.split(" ").shift().split("%").shift().trim(),
                                    african: document.querySelector('.highcharts-color-2 tspan').textContent.split(" ").shift().split("%").shift().trim(),
                                    hawaiian: document.querySelector('.highcharts-color-3 tspan').textContent.split(" ").shift().split("%").shift().trim(),
                                    hispanic: document.querySelector('.highcharts-color-4 tspan').textContent.split(" ").shift().split("%").shift().trim(),
                                    white: document.querySelector('.highcharts-color-5 tspan').textContent.split(" ").shift().split("%").shift().trim(),
                                    multi: document.querySelector('.highcharts-color-6 tspan').textContent.split(" ").shift().split("%").shift().trim()
                                },
                                other: {
                                    spedEligible: document.querySelector('div.title:nth-of-type(3) div.pct-holder').textContent.split("%").shift().trim(),
                                    lowIncome: document.querySelector('div.row:nth-of-type(2) div.pct-holder').textContent.split("%").shift().trim(),
                                    englishLearners: document.querySelector('div.title:nth-of-type(1) div.pct-holder').textContent.split("%").shift().trim(),
                                } 
                            },
                            act: {
                                composite: document.querySelector('tr:nth-of-type(12) td.noborder-top:nth-of-type(6)').textContent.trim(),
                                reading: document.querySelector('tr:nth-of-type(8) td.noborder-top:nth-of-type(6)').textContent.trim(),
                                english: document.querySelector('tr:nth-of-type(9) td.noborder-top:nth-of-type(6)').textContent.trim(),
                                math: document.querySelector('tr:nth-of-type(10) td.noborder-top:nth-of-type(6)').textContent.trim(),
                                science: document.querySelector('tr:nth-of-type(11) td.noborder-top:nth-of-type(6)').textContent.trim(),
                            },
                            schoolEnvironment: {
                                expulsions: (document.querySelector('div:nth-of-type(10) tr:nth-of-type(7) td.FY-30:nth-of-type(6)') === null) ? "null" : document.querySelector('div:nth-of-type(10) tr:nth-of-type(7) td.FY-30:nth-of-type(6)').textContent.trim(),
                                weaponInc: (document.querySelector('div:nth-of-type(10) tr:nth-of-type(8) td.FY-30:nth-of-type(6)') === null) ? "null" : document.querySelector('div:nth-of-type(10) tr:nth-of-type(8) td.FY-30:nth-of-type(6)').textContent.trim(),
                                staffAssaults: (document.querySelector('div:nth-of-type(10) tr:nth-of-type(9) td.FY-30:nth-of-type(6)') === null) ? "null" : document.querySelector('div:nth-of-type(10) tr:nth-of-type(9) td.FY-30:nth-of-type(6)').textContent.trim(),
                                studentAssaults: (document.querySelector('.src-container > table.report-card-section-table.print-50 tr:nth-of-type(10) td:nth-of-type(6)') === null) ? "null" : document.querySelector('.src-container > table.report-card-section-table.print-50 tr:nth-of-type(10) td:nth-of-type(6)').textContent.trim(),
                                refLEO: (document.querySelector('.report-card-section-table.print-50 tr:nth-of-type(11) td.src-data-value:nth-of-type(6)') === null) ? "null" : document.querySelector('.report-card-section-table.print-50 tr:nth-of-type(11) td.src-data-value:nth-of-type(6)').textContent.trim(),
                                schoolArrests: (document.querySelector('div:nth-of-type(10) tr:nth-of-type(12) td.src-data-value:nth-of-type(6)') === null) ? "null" : document.querySelector('div:nth-of-type(10) tr:nth-of-type(12) td.src-data-value:nth-of-type(6)').textContent.trim()
                            },
                            schoolPerformance: {
                                attendance: document.querySelector('.report-card-section-table.print-50 tr:nth-of-type(18) td.src-data-value:nth-of-type(6)').textContent.trim().split('%').join('').trim(),
                                dropout: document.querySelector('tr:nth-of-type(37) td.FY-30:nth-of-type(6)').textContent.trim().split('%').join('').trim(),
                                a: document.querySelector('tr:nth-of-type(5) td.FY-30:nth-of-type(6) span.FY-30').textContent.trim(),
                                b: document.querySelector('tr:nth-of-type(6) td.FY-30:nth-of-type(6) span.FY-30').textContent.trim(),
                                c: document.querySelector('tr:nth-of-type(7) td.FY-30:nth-of-type(6) span.FY-30').textContent.trim(),
                                d: document.querySelector('tr:nth-of-type(8) td.FY-30:nth-of-type(6) span.FY-30').textContent.trim(),
                                f: document.querySelector('tr:nth-of-type(9) td.FY-30:nth-of-type(6) span.FY-30').textContent.trim(),
                            },
                            teacherQuality: {
                                certified: document.querySelector('.print-66 tbody:nth-of-type(1) tr:nth-of-type(3) td:nth-of-type(6)').textContent.split('%').join('').trim(),
                                bachelors: document.querySelector('.page-wrapper tbody:nth-of-type(1) tr:nth-of-type(4) td:nth-of-type(6)').textContent.split('%').join('').trim(),
                                masters: document.querySelector('.page-wrapper tbody:nth-of-type(1) tr:nth-of-type(5) td.src-data-value:nth-of-type(6)').textContent.split('%').join('').trim(),
                                advanced: document.querySelector('.page-wrapper tbody:nth-of-type(1) tr:nth-of-type(6) td.src-data-value:nth-of-type(6)').textContent.split('%').join('').trim()
                            }
                        };
                    });
                    let ndata = Object.assign(schData, ecoData);
                    ndata.zip = zips[lea1].split(" ").pop()
                    log(chalk.green(`Done with NCES School ID: ${nlea}, District ID: ${lea}`));
                    fs.readFile('./data.json', function(err, data){
                        let da = JSON.parse(data);
                        da.push(ndata);
                        fs.writeFile('./data.json', JSON.stringify(da), function(err){
                            if(err) return console.log(err);
                        })
                    })
                };
                browser.close()
            });
        });
    });
})();