const casper = require("casper").create({ // eslint-disable-line
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
  },
});

const fecha = require("fecha");

const fs = require("fs");

const urls = params => ({
  kanttiini: "http://www.smarteat.fi/menu-pitskun-kanttiini/",
  variantti: "https://www.taitotalo.com/fi/ravintolat/lounaslistat/variantti-viikon-lounaslista/",
  blancco: "http://www.ravintolablancco.com/lounaviikko/pitajanmaki/",
  factory: "http://www.ravintolafactory.com/lounasravintolat/ravintolat/helsinki-pitajanmaki/",
  taste: `http://www.sodexo.fi/ruokalistat/output/weekly_html/6095/${params}/fi`,
});

const selectors = {
  blancco: ".entry-content",
  kanttiini: ".siteorigin-widget-tinymce.textwidget",
  variantti: ".lunch-list",
  taste: "h1",
  factory: ".post_content .col-xs-12",
};

const tasteParams = fecha.format(new Date(), "yyyy/mm/dd");

const replaceAllTags = (html) => {
  const divOpen = "<div";
  const divClose = "</div>";

  const spanOpen = "<span";
  const spanClose = "</span>";

  return html
    .replace(/class=/gi, "removed=")
    .replace(/style=/gi, "removed=")
    // .replace(/<br(\s+)?(\/)?(\s+)?>/gi, '')
    .replace(/<h1/gi, divOpen).replace(/<\/h1>/gi, "")
    .replace(/<h2/gi, divOpen).replace(/<\/h2>/gi, divClose)
    .replace(/<h3/gi, divOpen).replace(/<\/h3>/gi, divClose)
    .replace(/<h4/gi, divOpen).replace(/<\/h4>/gi, divClose)
    .replace(/<h5/gi, divOpen).replace(/<\/h5>/gi, divClose)
    .replace(/<h6/gi, divOpen).replace(/<\/h6>/gi, divClose)
    .replace(/<table/gi, divOpen).replace(/<\/table>/gi, divClose)
    .replace(/<thead/gi, divOpen).replace(/<\/thead>/gi, divClose)
    .replace(/<tbody/gi, divOpen).replace(/<\/tbody>/gi, divClose)
    .replace(/<tfoot/gi, divOpen).replace(/<\/tfoot>/gi, divClose)
    .replace(/<td/gi, divOpen).replace(/<\/td>/gi, divClose)
    .replace(/<tr/gi, divOpen).replace(/<\/tr>/gi, divClose)
    .replace(/<th/gi, divOpen).replace(/<\/th>/gi, divClose)
    .replace(/<p/gi, divOpen).replace(/<\/p>/gi, divClose)
    .replace(/<ul/gi, divOpen).replace(/<\/ul>/gi, divClose)
    .replace(/<li/gi, divOpen).replace(/<\/li>/gi, divClose)
    .replace(/<b>/gi, `${spanOpen}>`).replace(/<\/b>/gi, spanClose)
    .replace(/<i/gi, spanOpen).replace(/<\/i>/gi, spanClose)
    .replace(/<strong/gi, spanOpen).replace(/<\/strong>/gi, spanClose)
    .replace(/<em/gi, spanOpen).replace(/<\/em>/gi, spanClose);
};

casper.start().each(Object.keys(urls), (self, key) => {
  const url = urls(tasteParams)[key];
  self.thenOpen(url, function run() {
    if (key !== "taste") {
      const html = this.getHTML(selectors[key], true);
      fs.write(`./static/crawled/${key}.html`, replaceAllTags(html), "w");
    } else {
      const elements = this.getElementsInfo("table");
      fs.write(`./static/crawled/${key}.html`, replaceAllTags(elements[0].html) + replaceAllTags(elements[1].html), "w");
    }
    this.echo(`${key} OK`);
  });
});

casper.run(function run() {
  this.echo("Crawling done!").exit();
});
