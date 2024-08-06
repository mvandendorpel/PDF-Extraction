import fs from 'fs';
import { PdfDocument } from '@pomgui/pdf-tables-parser';
import { convertArrayToCSV } from 'convert-array-to-csv';
const CORPAY_TEST_FILE = '240531_MTMReport1_Stmt-1.pdf';
const CORPAY_TEST_FILE_2 = '220930_MTMReport1_Stmt.pdf';
const ALPHA_TEST_FILE = 'Monthly Trades - 202405-1.pdf';
const SCOTIA_TEST_FILE = 'FXO_MTM_VSFI_20220926.pdf'


//This is likely not a viable solution.  There is too much handling for each individual file, it's likely to get worse as more samples are tested.

const processCorpayPDF = async (pdfPages) => {
    console.log('Processing Corpay PDF');
    let mtmTable = pdfPages[1].tables[0].data;
    let cleanTableColumns = mtmTable[0];
    for (let i = 0; i < mtmTable[1].length; i++) {
        if (cleanTableColumns[i] == null) { cleanTableColumns[i] = mtmTable[1][i]}
    }
    mtmTable.splice(1, 2);
    for (let i = 2; i < pdfPages.length; i++) {
        if (pdfPages[i].tables[0].numcols === cleanTableColumns.length) {
            pdfPages[i].tables[0].data.map((e) => {
                mtmTable.push(e)
            })
        }
    }
    // if (pdfPages[2].tables[0].numcols === pdfPages[1].tables[0].numcols) {pdfPages[2].tables[0].data.map((e) => {
    //     mtmTable.push(e)
    // })};
    mtmTable.pop();
    mtmTable.pop();
    mtmTable.pop();
    //This clears errors that arise from one of the columns "spilling over" into the next one
    if (mtmTable[0][7].endsWith("DIR")) {
        console.log("column error found");
        mtmTable[0].splice(8, 0, mtmTable[0][7].split(" ")[1]);
        mtmTable[0][7] = mtmTable[0][7].split(" ", 1)[0];
        console.log(mtmTable[0][7]);
        for (let i = 1; i < mtmTable.length; i++) {
            const oldColumnData = mtmTable[i][7].split(" ");
            if (oldColumnData.length > 1)  {mtmTable[i].splice(8, 0, oldColumnData.pop())}
            mtmTable[i][7] = oldColumnData.toString().replace(",", " ");
        }
    }
    // console.log(mtmTable[0]);
    // console.log(mtmTable[1]);
    // console.log(mtmTable[3]);
    console.log(mtmTable.length);
    console.log(pdfPages[2].tables[0].data)
    return mtmTable;
}


const main = async (file, counterparty) => {
    let cleanTable;
    const pdf = new PdfDocument();
    await pdf.load(file);
    let pdfPages = pdf.pages;
    if (counterparty === 'Corpay') {
        cleanTable = await processCorpayPDF(pdfPages);
        const csvString = await convertArrayToCSV(cleanTable)
        fs.writeFileSync('test.csv', csvString);
    }
    
};


main(CORPAY_TEST_FILE, "Corpay");