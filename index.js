import fs from "fs"; // File system module
import Papa from "papaparse"; // CSV parsing module
import yaml from "js-yaml"; // Converts Javascript Object to valid yaml properties

function sanitizeFileName(name) {
  const invalidCharRegex = /[\\/:*?"<>|]/g;

  return name.replace(invalidCharRegex, "_");
}

const csvFileName = "input.csv"; // change the value of the string to your csv file name

// Read the CSV file
fs.readFile(`input/${csvFileName}`, "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // Parse the CSV data
  const csvData = Papa.parse(data, {
    header: true, // Use the first row as the header
  });

  // Loop through each row in the CSV data
  csvData.data.forEach((row) => {
    // Extract the frontmatter properties and content from the row
    const frontmatter = {
      title: row.Title,
      postStatus: row["Post status"],
      pubDate: row["Published date"],
      tags: row.Tags,
      categories: row.Categories?.split("|"),
    };

    const validFrontMatter = yaml.dump(frontmatter, {
      indent: 2,
      styles: {
        categories: "block",
      },
    });

    const parsedContent = row.Content ?? "";

    // Create the Markdown file
    const markdown = `---\n${validFrontMatter}\n---\n\n${parsedContent}\n`;

    if (!fs.existsSync("markdown")) fs.mkdirSync("markdown"); // Create the output directory if it doesn't exist

    const fileName = `${process.cwd()}/markdown/${sanitizeFileName(
      row.Title
    )}.md`;

    // Write the Markdown file to disk
    fs.writeFile(fileName, markdown, (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
});
