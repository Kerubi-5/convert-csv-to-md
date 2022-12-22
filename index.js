import fs from "fs"; // File system module
import Papa from "papaparse"; // CSV parsing module
import yaml from "js-yaml"; // Converts Javascript Object to valid yaml properties
import { Parser } from "xml2js";
import { createInterface } from "readline";

// Create a readline interface
const r1 = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function sanitizeFileName(name) {
  const invalidCharRegex = /[\\/:*?"<>|]/g;

  return name.replace(invalidCharRegex, "_");
}

function createMarkdownFile(frontmatter, content) {
  const validFrontMatter = yaml.dump(frontmatter, {
    indent: 2,
    styles: {
      categories: "block",
    },
  });

  const parsedContent = content ?? "";

  // Create the Markdown content
  const markdown = `---\n${validFrontMatter}\n---\n\n${parsedContent}\n`;

  if (!fs.existsSync("markdown")) fs.mkdirSync("markdown"); // Create the output directory if it doesn't exist

  const fileName = `${process.cwd()}/markdown/${sanitizeFileName(
    frontmatter.title
  )}.md`;

  // Write the Markdown file to disk
  fs.writeFile(fileName, markdown, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

// Prompt user for the file name
r1.question(
  "Enter the name of your file NOTE: (make sure to put it inside the input folder or if it doesn't exist kindly create one): ",
  (csvFileName) => {
    console.log("Parsing and reading your files...");

    // Read the file
    fs.readFile(`input/${csvFileName}`, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        r1.close();
        return;
      }

      const fileExtension = csvFileName.match(/\.[^.]+$/)[0];

      if (fileExtension === ".csv") {
        // Parse the CSV data
        const csvData = Papa.parse(data, {
          header: true, // Use the first row as the header
        });

        // Loop through each row in the CSV data
        csvData.data.forEach((row) => {
          // Extract the frontmatter properties and content from the row
          const frontmatter = {
            title: row.Title,
            status: row["Post status"],
            datePublished: row["Published date"],
            tags: row.Tags,
            categories: row.Categories?.split("|"),
          };

          createMarkdownFile(frontmatter, row.Content);
        });
      } else if (fileExtension === ".xml") {
        const xmlParser = new Parser();

        xmlParser.parseString(data, (err, result) => {});
      } else {
        console.log("Your file is neither a csv or xml");
      }

      console.log(
        "Finished converting your files take a look at the markdown folder inside your directory"
      );

      r1.close();
    });
  }
);
