let PlacementsData = [];
let InternshipsData = [];

const PLACEMENT_RECRUITMENT = "Placement";
let Recruitment = "Placement";

async function fetchData() {
  return new Promise((resolve) => {
    fetch("https://cors-anywhere.herokuapp.com/http://placements.mnit.ac.in/api/placements/getAll", { method: "POST" })
      .then((res) => res.json())
      .then((res) => {
        const data = res.placements;

        let Placements = [];
        let Internships = [];
        data.forEach((item) => {
          let obj = {
            student_name: item.students[0].student_name,
            branch: item.students[0].department,
            company_name: item.company_name,
            date: item.recruitment_date,
            recruitment_type: item.recruitment_type,
            batch: item.passout_batch,
            job_profile: item.job_profile,
            package: item.recruitment === PLACEMENT_RECRUITMENT ? item.package : item.intern_stipend,
          };
          if (item.recruitment == PLACEMENT_RECRUITMENT) Placements.push(obj);
          else Internships.push(obj);
        });

        Placements.sort((o1, o2) => o2.package - o1.package);
        Internships.sort((o1, o2) => o2.package - o1.package);
        PlacementsData = [...Placements];
        InternshipsData = [...Internships];
        resolve();
      })
      .catch((err) => resolve(err))
      .catch((err) => resolve(err));
  });
}

function pieChart(a) {
  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(drawChart);

  let data = [];
  Object.keys(a).forEach((key) => {
    data.push([key, a[key].total_students]);
  });

  function drawChart() {
    let piData = google.visualization.arrayToDataTable([["Branch", "Placed"], ...data]);
    let options = {
      title: "Placements",
    };
    let chart = new google.visualization.PieChart(document.getElementById("global-chart"));
    chart.draw(piData, options);
  }
}

function renderTable() {
  const Data = Recruitment === PLACEMENT_RECRUITMENT ? PlacementsData : InternshipsData;
  const branchInfo = {};
  const globalInfo = { total_students: 0, total_package: 0, max_package: 0 };

  let index = 1;
  let dataHtml = "";

  Data.forEach((item) => {
    const { student_name, branch, company_name, recruitment_type, batch, job_profile, package, date } = item;
    const package_number = Number(package);
    dataHtml += `<tr>
                  <td> ${index} </td>
                  <td> ${student_name} </td>
                  <td> ${branch} </td>
                  <td> ${company_name} </td>
                  <td> ${job_profile} </td>
                  <td> ${recruitment_type} </td>
                  <td> ${date} </td>
                  <td> ${package} </td>
              </tr>`;

    if (!branchInfo[branch]) branchInfo[branch] = { total_students: 0, total_package: 0, max_package: 0 };

    branchInfo[branch].total_students++;
    branchInfo[branch].total_package += package_number;
    branchInfo[branch].max_package = Math.max(branchInfo[branch].max_package, package_number);

    globalInfo.total_students++;
    globalInfo.total_package += package_number;
    globalInfo.max_package = Math.max(globalInfo.max_package, package_number);

    index++;
  });

  let globalHtml = "";
  Object.keys(branchInfo).forEach((key) => {
    globalHtml += `<tr><th>  ${key} </th><td> ${branchInfo[key].total_students}</td><td>${branchInfo[key].max_package}</td><td>${Number(
      (branchInfo[key].total_package / branchInfo[key].total_students).toFixed(2)
    )}</td></tr>`;
  });
  globalHtml += "<tr><td colspan='4'> -- </td></tr>";
  globalHtml += `<tr><th> Cummulative </th><td> ${globalInfo.total_students}</td><td> ${globalInfo.max_package} </td><td>${Number(
    (globalInfo.total_package / globalInfo.total_students).toFixed(2)
  )}</td></tr>`;

  $("#global-a-body").html(globalHtml);

  if (Recruitment === PLACEMENT_RECRUITMENT) {
    $("#data-table-body").html(dataHtml);
    $("#data-table").DataTable({
      paging: false,
    });
  } else {
    $("#data-table-internship-body").html(dataHtml);
    $("#data-table-internship").DataTable({
      paging: false,
    });
  }

  pieChart(branchInfo);
}

async function initial() {
  await fetchData();
  renderTable();
}

function changeRecruitment(ele) {
  Recruitment = ele.value;
  if (Recruitment === PLACEMENT_RECRUITMENT) {
    $("#data-table").removeClass("d-none");
    $("#data-table-internship").addClass("d-none");
  } else {
    $("#data-table").addClass("d-none");
    $("#data-table-internship").removeClass("d-none");
  }

  if (PlacementsData.length) {
    renderTable();
  }
}

initial();
