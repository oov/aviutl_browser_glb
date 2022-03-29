(async () => {
const fs = require('fs');
const axios = require('axios');

const insertLicenses = async (readme) => {
  const buffers = [];
  for await (const chunk of process.stdin) buffers.push(chunk.toString());
  const licenses = JSON.parse(buffers.join());
  for (let e in licenses) {
    const l = licenses[e];
    readme.push("### " + e);
    readme.push("");
    readme.push(l.repository);
    readme.push("");
    if (e.indexOf("draco3d") == 0 && l.licenseFile.indexOf("README.md") != -1) {
      const r = await axios.get('https://raw.githubusercontent.com/google/draco/master/LICENSE');
      if (r.status !== 200) {
        throw "failed to receive license file for draco3d";
      }
      readme.push(r.data.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n").trim());
    } else {
      readme.push(fs.readFileSync(l.licenseFile, 'utf8').toString().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n").trim());
    }
    readme.push("");
  }
};

const lines = fs.readFileSync(__dirname + "/../README.in.md", 'utf8').toString().replace(/\r\n/g, "\n").split("\n");
const readme = [];
for (let line of lines) {
  if (line == "`make-readme.js inserts the license information for the dependent libraries`") {
    await insertLicenses(readme);
    if (readme[readme.length-1] == "") {
      readme.pop();
    }
    continue;
  }
  readme.push(line);
}

console.log(readme.join("\r\n").trim());
})();