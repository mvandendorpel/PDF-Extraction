import cv2
from pdf2image import convert_from_path
from pdf2image.exceptions import (
    PDFInfoNotInstalledError,
    PDFPageCountError,
    PDFSyntaxError
)
import pytesseract

pages = convert_from_path('240531_MTMReport1_Stmt-1.pdf', 300)

for page_num, page, in enumerate(pages):
    page.save(f'page_{page_num}.png', 0)

    img = cv2.imread(f'page_{page_num}.png', 0)

    thresh = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    contours, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    file = open(f'page_{page_num}.txt', 'a')
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if w > 50 and h > 20:
            cell_img = img[y:y+h, x:x+w]
            text = pytesseract.image_to_string(cell_img)
            file.write(f'Page {page_num}, Cell ({x}, {y}): {text}')


