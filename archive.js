/** @format */

document.addEventListener("DOMContentLoaded", init, false);

let data, table, sortCol;
let sortAsc = false;
const pageSize = 50;
let curPage = 1;

// var x = document.getElementById("catTable").rows.length;
// document.getElementById("catTable").innerHTML =
//   "Found " + x + " tr elements in the table.";

async function init() {
  // Select the table (well, tbody)
  table = document.querySelector("#catTable tbody");
  // get the cats
  let resp = await fetch(
    "https://www.raymondcamden.com/.netlify/functions/get-cats"
  );
  data = resp.json();
  renderTable();

  // listen for sort clicks
  document.querySelectorAll("#catTable thead tr th").forEach((t) => {
    t.addEventListener("click", sort, false);
  });

  document
    .querySelector("#nextButton")
    .addEventListener("click", nextPage, false);
  document
    .querySelector("#prevButton")
    .addEventListener("click", previousPage, false);
}

function renderTable() {
  // create html
  let result = "";
  data
    .filter((row, index) => {
      let start = (curPage - 1) * pageSize;
      let end = curPage * pageSize;
      if (index >= start && index < end) return true;
    })
    .forEach((c) => {
      result += `<tr>
     <td>${c._id}</td>
     <td>${c.memberAssisted}</td>
     <td>${c.memberAssisted}</td>
     <td>${c.memberAssisted}</td>
     </tr>`;
    });
  table.innerHTML = result;
}

function sort(e) {
  let thisSort = e.target.dataset.sort;
  if (sortCol === thisSort) sortAsc = !sortAsc;
  sortCol = thisSort;
  console.log("sort dir is ", sortAsc);
  data.sort((a, b) => {
    if (a[sortCol] < b[sortCol]) return sortAsc ? 1 : -1;
    if (a[sortCol] > b[sortCol]) return sortAsc ? -1 : 1;
    return 0;
  });
  renderTable();
}

function previousPage() {
  if (curPage > 1) curPage--;
  renderTable();
}

function nextPage() {
  if (curPage * pageSize < data.length) curPage++;
  renderTable();
}

function myFunction() {
  // Declare variables
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("seacrhInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("catTable");
  tr = table.getElementsByTagName("tr");
  console.log(table);

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
