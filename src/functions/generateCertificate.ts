import chromium from "chrome-aws-lambda"
import path from "path"
import fs from "fs"
import dayjs from "dayjs"
import { S3 } from "aws-sdk"

import {document} from "../utils/dynamoDBClient"
import { compile } from "src/utils/compile"


export const handle = async (event) => {
    const {grade,id,name} = JSON.parse(event.body) as ICreateCertificate;

    await document.put({
        TableName: "users_certificates",
        Item: {
            id,
            name,
            grade
        }
    }).promise();

    const medalPath = path.join(process.cwd(), "src", "templates", "selo.png")
    const medal = fs.readFileSync(medalPath, "base64")

    const data: ITemplateProps = {
        id,
        name,
        grade,
        date: dayjs().format("DD/MM/YYYY"),
        medal
    }

    const content = await compile(data);

    const browser = await chromium.puppeteer.launch({
        headless: true,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath
    })

    const page = browser.newPage();

    (await page).setContent(content)

    const pdf = (await page).pdf({
        format: "A4",
        landscape: true,
        path: process.env.IS_OFFLINE ?  "certificate.pdf": null,
        printBackground: true,
        preferCSSPageSize: true,
    })

    await browser.close();

    const s3 = new S3();

    await s3.putObject({
        Bucket: process.env.BUCKET_NAME,
        Key: `${id}.pdf`,
        ACL: "public-read",
        Body: pdf,
        ContentType: "application/pdf"
    })

    return {
        statusCode: 201,
        body: JSON.stringify({
            message: "Certificate created"
        }),
        headers: {
            "Content-Type": "apllication/json"
        }
    }
}