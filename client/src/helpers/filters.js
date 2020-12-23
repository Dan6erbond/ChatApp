import Vue from "vue";

Vue.filter("datetime", value => {
  if (!value) return "";
  if (typeof value.getMonth !== "function") return "";

  return `${value.toLocaleDateString()} ${value
    .toLocaleTimeString()
    .slice(0, -3)}`;
});
