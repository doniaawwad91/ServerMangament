// Loading
window.addEventListener("load", function () {
  document.querySelector("body").classList.add("loaded");
});

// Global decelerations
const dataArrayObj = [];
const logObj = [];
let counter = 0;

// fetch the form from json config file to modify the sections
fetch(`assets/inputdata.json`, {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})
  .then((response) => response.json())
  .then((response) => {
    for (var key in response) {
      var singleDiv = document.createElement("div");
      singleDiv.setAttribute("class", "col-md-12 position-relative");
      var multiDiv = singleDiv.cloneNode(true);

      var inputLabel = document.createElement("label");
      inputLabel.setAttribute("for", response[key].name);
      inputLabel.setAttribute("class", "form-label");
      inputLabel.innerHTML = response[key].title;

      var jsonInput = document.createElement("INPUT");
      jsonInput.setAttribute("type", response[key].type);
      jsonInput.setAttribute("class", "form-control");
      jsonInput.setAttribute("name", response[key].name);
      jsonInput.setAttribute("id", response[key].name);

      jsonInput.setAttribute("inputType", response[key].inputType);
      if (response[key].ip == "ip") {
        let pattern =
          "((^|\\.)((25[0-5])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))){4}$";
        jsonInput.setAttribute("pattern", pattern);
      }
      if (response[key].type !== "password") {
        jsonInput.setAttribute("Required", "Required");
      }

      var invalidDiv = document.createElement("div");
      invalidDiv.setAttribute("class", "invalid-feedback");

      if (response[key].ip == "ip") {
        invalidDiv.innerHTML = "Please enter a valid ip";
      } else {
        invalidDiv.innerHTML = "Required";
      }

      var buttonForm = document.createElement("button");
      buttonForm.setAttribute("type", response[key].lablefor);
      buttonForm.setAttribute("class", "btn btn-primary");
      buttonForm.innerHTML = "Add server";

      if (
        response[key].inputType == "single" ||
        response[key].inputType == "both"
      ) {
        singleDiv.appendChild(inputLabel);
        singleDiv.appendChild(jsonInput);
        singleDiv.appendChild(invalidDiv);
        document.getElementById("single_server").appendChild(singleDiv);
      }
      if (
        response[key].inputType == "multi" ||
        response[key].inputType == "both"
      ) {
        multiDiv.appendChild(inputLabel.cloneNode(true));
        multiDiv.appendChild(jsonInput.cloneNode(true));
        multiDiv.appendChild(invalidDiv);
        document.getElementById("multi_server").appendChild(multiDiv);
      }
    }
    document.getElementById("single_server").appendChild(buttonForm);

    document
      .getElementById("multi_server")
      .appendChild(buttonForm.cloneNode(true));

    createTable(response);
  })
  .catch(function () {
    document.write("Json file not found!");
  });
// initialize the table in the Dom
function createTable(response) {
  var myTableDiv = document.getElementById("server-table");
  var table = document.createElement("TABLE");
  table.setAttribute(
    "class",
    "table align-items-center table-striped table-hover"
  );
  table.setAttribute("id", "table");
  var tableHead = document.createElement("THEAD");
  tableHead.setAttribute("class", "thead-light");
  var tableHeadTr = document.createElement("TR");

  for (var key in response) {
    if (response[key].inputType !== "multi") {
      var th = document.createElement("th");
      th.setAttribute("scope", "col");
      th.innerHTML = response[key].title;
      tableHeadTr.appendChild(th);
    }
  }

  tableHead.appendChild(tableHeadTr);
  var tableBody = document.createElement("TBODY");
  table.appendChild(tableHead);
  table.appendChild(tableBody);
  myTableDiv.appendChild(table);
}

// create the row element on the dom on every iteration
function createRow(arrayOfRow) {
  var myTable = document
    .getElementById("table")
    .getElementsByTagName("tbody")[0];
  var row = myTable.insertRow();
  arrayOfRow.forEach(function (item, index, array) {
    row.insertCell(index).appendChild(document.createTextNode(item));
  });
}
// helper function for multi server additions
function getLastIpNumber(number = "", index = 0) {
  var g = /\.([0-9a-z]+)$/i;
  var numbers = number.split(g);
  return numbers[index];
}

// beatify the import button
function thisFileUpload() {
  document.getElementById("file").click();
}
// CAll Import data from json on file change
(function () {
  document.getElementById("file").addEventListener("change", onChange);
  function onChange(event) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
  }
  function onReaderLoad(event) {
    var obj = JSON.parse(event.target.result);
    ImportDataFromJson(obj);
  }
  // Import data from json 
  function ImportDataFromJson(obj) {
    if (obj.length + counter < 64) {
      var elements = obj;

      for (var i = 0, element; (element = elements[i++]);) {
        var arrayTable = [];
        arrayTable.push(element.serverName);
        arrayTable.push(element.ansible_host);
        arrayTable.push(element.ansible_ssh_pass);
        createRow(arrayTable);

        var obj = {};
        obj["serverName"] = element.serverName;
        obj["ansible_host"] = element.ansible_host;
        obj["ansible_connection"] = "ssh";
        obj["ansible_ssh_user"] = "root";
        obj["ansible_ssh_pass"] = element.ansible_ssh_pass;
        obj["ansible_become_user"] = "root";
        obj["ansible_become_pass"] = element.ansible_ssh_pass;

        dataArrayObj.push(obj);
        counter++;
      }
      logObj.push("imported file successfully at : " + new Date());
    } else {
      alert("message?: Your json file + counter have more than 64 server");
      logObj.push(
        "trying to import a file failed cause more than 64 servers (counter + json file) at : " +
        new Date()
      );
    }
  }
})();


// export global obj to json
function exportJson(
  content = JSON.stringify(dataArrayObj),
  fileName = "servers.json",
  contentType = "application/json"
) {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  console.log(' ansible -i hosts all -m ping');
}

// export deployment log
function exportLog(
  content = logObj.toString(),
  fileName = "log.txt",
  contentType = "text/plain"
) {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

// export global obj to Yaml
function exportYaml(
  content = json2yaml(dataArrayObj),
  fileName = "servers.yaml",
  contentType = "application/x-yaml"
) {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  console.log(' ansible -i hosts all -m ping');
}

// handling form submit and validation
(function () {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");

        if (form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();

          if (form.getAttribute("name") == "single_server") {
            if (counter < 64) {
              var elements = form.elements;
              var arrayFrom = [];
              for (var i = 0, element; (element = elements[i++]);) {
                if (
                  element.getAttribute("inputType") != "multi" &&
                  element.getAttribute("inputType") !== null
                ) {
                  if (element.getAttribute("id") == "serverPassword") {
                    if (element.value != "") arrayFrom.push(element.value);
                    else arrayFrom.push("testpass");
                  } else {
                    arrayFrom.push(element.value);
                  }
                }
              }
              createRow(arrayFrom);
              var obj = {};
              obj["serverName"] = arrayFrom[0];
              obj["ansible_host"] = arrayFrom[1];
              obj["ansible_connection"] = "ssh";
              obj["ansible_ssh_user"] = "root";
              obj["ansible_ssh_pass"] = arrayFrom[2];
              obj["ansible_become_user"] = "root";
              obj["ansible_become_pass"] = arrayFrom[2];

              dataArrayObj.push(obj);
              counter++;

              logObj.push(
                "added single server successfully at : " + new Date()
              );
            } else {
              alert("more than 64 server is not allowed");
              logObj.push(
                "trying to added single server failed cause there is more than 64 servers (counter) at : " +
                new Date()
              );
            }
          } else {
            if (counter < 64) {
              var elements = form.elements;
              var arrayFrom = [];
              var serverRangeFrom = null;
              var serverRangeTo = null;

              for (var i = 0, element; (element = elements[i++]);) {
                if (
                  element.getAttribute("inputType") != "single" &&
                  element.getAttribute("inputType") !== null
                ) {
                  if (element.getAttribute("id") == "serverRangeFrom")
                    serverRangeFrom = element.value;
                  else if (element.getAttribute("id") == "serverRangeTo")
                    serverRangeTo = element.value;
                  else if (element.getAttribute("id") == "serverPassword") {
                    if (element.value != "") arrayFrom.push(element.value);
                    else arrayFrom.push("testpass");
                  } else arrayFrom.push(element.value);
                }
              }
              var startNumber = getLastIpNumber(serverRangeFrom, 1);
              var EndNumber = getLastIpNumber(serverRangeTo, 1);

              var sum = EndNumber - startNumber;
              var totalSum = sum + counter;

              if (totalSum < 64) {
                for (
                  var i = parseInt(startNumber);
                  i <= parseInt(EndNumber);
                  i++
                ) {
                  var finalArray = [
                    "server_" + i,
                    getLastIpNumber(serverRangeFrom, 0) + "." + i,
                  ];
                  arrayFrom.forEach((element) => {
                    finalArray.push(element);
                  });

                  createRow(finalArray);
                  var obj = {};
                  obj["serverName"] = finalArray[0];
                  obj["ansible_host"] = finalArray[1];
                  obj["ansible_connection"] = "ssh";
                  obj["ansible_ssh_user"] = "root";
                  obj["ansible_ssh_pass"] = finalArray[2];
                  obj["ansible_become_user"] = "root";
                  obj["ansible_become_pass"] = finalArray[2];

                  dataArrayObj.push(obj);
                  counter++;
                }
                logObj.push(
                  "added multi server successfully at : " + new Date()
                );
              } else {
                alert("more than 64 server is not allowed ");
                logObj.push(
                  "trying to added multi server failed cause there is more than 64 servers (counter + range sum) at : " +
                  new Date()
                );
              }
            } else {
              alert("more than 64 servers is not allowed");
              logObj.push(
                "trying to added multi server failed cause there is more than 64 servers (counter) at : " +
                new Date()
              );
            }
          }
          form.reset();
          form.classList.remove("was-validated");
        }
      },
      false
    );
  });
})();