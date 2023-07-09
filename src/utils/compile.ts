import Handlebars from "handlebars"

import path from "path";
import fs from "fs"

export const compile = async function(data: ITemplateProps){
    const filePath =  path.join(process.cwd(), "src/templates/template.hbs");

    const html = fs.readFileSync(filePath, "utf-8");

    return Handlebars.compile(html)(data);
}