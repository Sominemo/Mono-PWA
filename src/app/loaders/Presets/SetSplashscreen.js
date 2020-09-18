import SplashScreenController from "@Environment/Loaders/SplashScreenController"

SplashScreenController.name = "monobank PWA"
SplashScreenController.splashImage.innerHTML = require("@Resources/images/logo/vector.svg")

SplashScreenController.splashImage = SplashScreenController.splashImage.firstChild
SplashScreenController.splashImage.style.height = "30vh"
SplashScreenController.splashBG = "#181A1D"
SplashScreenController.splashColor = "#ffffff"
