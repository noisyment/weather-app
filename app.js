const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const _ = require("lodash");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const port = process.env.PORT;

const weatherData = {
  cityName: "",
  temp: "",
  weatherIcon: "",
  description: ""
};

const appData = {
  citySearch: "",
  errorStatus: false
};

app.get("/", (req, res) => {
  res.render("home", {
    errorStatus: appData.errorStatus
  });
  appData.errorStatus = false;
});

app.post("/", (req, res) => {
  appData.citySearch = req.body.cityName;
  res.redirect("/search");
});

app.get("/search", (req, res) => {
  const apiKey = process.env.API_KEY;

  // set options for current temperature request
  const currentOptions = {
    url: "https://api.openweathermap.org/data/2.5/weather",
    method: "GET",
    qs: {
      q: appData.citySearch,
      appid: apiKey,
      units: "metric"
    }
  };
  // request current temperature data
  request(currentOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const data = JSON.parse(body);

      weatherData.cityName = data.name;
      weatherData.temp = data.main.temp;
      weatherData.description = _.capitalize(data.weather[0].description);
      weatherData.weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

      res.redirect("/search/" + _.kebabCase(weatherData.cityName));
    } else {
      appData.errorStatus = true;
      res.redirect("/");
    }
  });
});

app.get("/search/:cityName", (req, res) => {
  if (appData.citySearch !== "") {
    res.render("result", {
      cityName: weatherData.cityName,
      temp: weatherData.temp,
      description: weatherData.description,
      weatherIcon: weatherData.weatherIcon
    });
    appData.citySearch = "";
  } else {
    appData.citySearch = _.lowerCase(req.params.cityName);
    res.redirect("/search");
  }
});

app.all("*", (req, res) => {
  appData.errorStatus = true;
  res.redirect("/");
});

app.listen(port || 3000, (req, res) => console.log("Server started on port 3000: http://localhost:3000"));
