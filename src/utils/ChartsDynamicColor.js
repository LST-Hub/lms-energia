const getChartColorsArray = (colorsStr) => {
  const colors = JSON.parse(colorsStr);
  if (!Array.isArray(colors)) return [];
  return colors.map(function (value) {
    var newValue = value.replace(" ", "");
    if (typeof getComputedStyle !== "function") {
      // Fallback for non-browser environments
      return colors.map((value) => value.trim()); // Basic example, adjust as needed
    }
    if (newValue.indexOf(",") === -1) {
      var color = getComputedStyle(document.documentElement).getPropertyValue(newValue);

      if (color.indexOf("#") !== -1) color = color.replace(" ", "");
      if (color) return color;
      else return newValue;
    } else {
      var val = value.split(",");
      if (val.length === 2) {
        var rgbaColor = getComputedStyle(document.documentElement).getPropertyValue(val[0]);
        rgbaColor = "rgba(" + rgbaColor + "," + val[1] + ")";
        return rgbaColor;
      } else {
        return newValue;
      }
    }
  });
};

export default getChartColorsArray;
