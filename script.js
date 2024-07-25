document.addEventListener("DOMContentLoaded", function() {
    updateDateTime();
    loadTimeSheet();
    loadStatistics();
    setInterval(updateDateTime, 1000);
});

function updateDateTime() {
    const currentDateTime = new Date();
    document.getElementById("current-date-time").innerText = currentDateTime.toLocaleString();
    document.getElementById("current-time").innerText = currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function punchInOut() {
    const currentDateTime = new Date();
    const punchInTime = localStorage.getItem("punchInTime");
    const punchOutTime = localStorage.getItem("punchOutTime");

    if (!punchInTime) {
        localStorage.setItem("punchInTime", currentDateTime.toISOString());
        document.getElementById("punch-in-time").innerText = currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        alert("Punched In!");
    } else if (!punchOutTime) {
        localStorage.setItem("punchOutTime", currentDateTime.toISOString());
        document.getElementById("punch-out-time").innerText = currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        alert("Punched Out!");
        saveTimeSheetEntry();
        localStorage.removeItem("punchInTime");
        localStorage.removeItem("punchOutTime");
    } else {
        alert("Already punched in and out today.");
    }
}

function saveTimeSheetEntry() {
    const punchInTime = new Date(localStorage.getItem("punchInTime"));
    const punchOutTime = new Date(localStorage.getItem("punchOutTime"));
    const currentDateTime = new Date().toLocaleDateString();

    const productionHours = calculateProductionHours(punchInTime, punchOutTime);

    const timeSheet = JSON.parse(localStorage.getItem("timeSheet")) || [];
    timeSheet.push({
        date: currentDateTime,
        punchIn: punchInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        punchOut: punchOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        productionHours: productionHours,
        breakTime: "0 hours 0 minutes",
        overtime: calculateOvertime(productionHours)
    });
    localStorage.setItem("timeSheet", JSON.stringify(timeSheet));
    loadTimeSheet();
    loadStatistics();
    updateSidebarNotification(); // Update sidebar notification dots
}

function calculateProductionHours(punchIn, punchOut) {
    const diffMs = punchOut - punchIn;
    const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // Hours
    const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // Minutes
    return `${diffHrs} hours ${diffMins} minutes`;
}

function calculateOvertime(productionHours) {
    const [hours, minutes] = productionHours.match(/\d+/g).map(Number);
    const totalMinutes = hours * 60 + minutes;
    const overtimeMinutes = totalMinutes > 480 ? totalMinutes - 480 : 0; // Anything above 8 hours (480 minutes) is overtime
    const overtimeHrs = Math.floor(overtimeMinutes / 60);
    const overtimeMins = overtimeMinutes % 60;
    return `${overtimeHrs} hours ${overtimeMins} minutes`;
}

function loadTimeSheet() {
    const timeSheet = JSON.parse(localStorage.getItem("timeSheet")) || [];
    const tbody = document.getElementById("timesheet-body");
    tbody.innerHTML = "";
    timeSheet.forEach((entry, index) => {
        const row = `
        <tr>
            <td>${index + 1}</td>
            <td>${entry.date}</td>
            <td>${entry.punchIn}</td>
            <td>${entry.punchOut}</td>
            <td>${entry.productionHours}</td>
            <td>${entry.breakTime}</td>
            <td>${entry.overtime}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
    updateSidebarNotification(); // Update sidebar notification dots
}

function loadStatistics() {
    const timeSheet = JSON.parse(localStorage.getItem("timeSheet")) || [];
    let todayHours = 0;
    let weekHours = 0;
    let monthHours = 0;
    let overtimeHours = 0;
    const today = new Date().toLocaleDateString();
    const weekStart = getStartOfWeek(new Date());
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    timeSheet.forEach(entry => {
        const entryDate = new Date(entry.date);
        const entryHours = parseTime(entry.productionHours);
        const entryOvertime = parseTime(entry.overtime);

        if (entry.date === today) {
            todayHours += entryHours;
        }
        if (entryDate >= weekStart) {
            weekHours += entryHours;
        }
        if (entryDate >= monthStart) {
            monthHours += entryHours;
        }
        overtimeHours += entryOvertime;
    });

    document.getElementById("today-stat").innerText = `${todayHours.toFixed(2)}hr/9hr`;
    document.getElementById("week-stat").innerText = `${weekHours.toFixed(2)} hr/40 hr`;
    document.getElementById("month-stat").innerText = `${monthHours.toFixed(2)} hr/160 hr`;
    document.getElementById("remaining-stat").innerText = `${(160 - monthHours).toFixed(2)} hr/160 hr`;
    document.getElementById("overtime-stat").innerText = `${overtimeHours.toFixed(2)} hr/160 hr`;
}

function getStartOfWeek(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
}

function parseTime(timeString) {
    const [hours, minutes] = timeString.match(/\d+/g).map(Number);
    return hours + minutes / 60;
}

function toggleActive(element) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.classList.remove("active");
    });
    element.parentNode.classList.add("active");
}

function showProfile() {
    // Placeholder function to handle profile button click
    alert("Show profile page or modal");
}

function updateSidebarNotification() {
    const timeSheet = JSON.parse(localStorage.getItem("timeSheet")) || [];
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        const link = item.querySelector(".nav-link");
        const notificationDot = item.querySelector(".notification-dot");
        const actionType = link.innerText.trim();
        const hasNotification = timeSheet.some(entry => entry.action === actionType && !entry.seen);

        if (hasNotification) {
            notificationDot.style.visibility = "visible";
        } else {
            notificationDot.style.visibility = "hidden";
        }
    });
}
function toggleActive(element) {
const navItems = document.querySelectorAll(".nav-item");
navItems.forEach(item => {
item.classList.remove("active");
});
element.parentNode.classList.add("active");
}
function loadStatistics() {
const timeSheet = JSON.parse(localStorage.getItem("timeSheet")) || [];
let todayHours = 0;
let weekHours = 0;
let monthHours = 0;
let overtimeHours = 0;
const today = new Date().toLocaleDateString();
const weekStart = getStartOfWeek(new Date());
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const monthHoursTarget = 160; // Assuming 160 working hours target for the month

timeSheet.forEach(entry => {
const entryDate = new Date(entry.date);
const entryHours = parseTime(entry.productionHours);
const entryOvertime = parseTime(entry.overtime);

if (entry.date === today) {
    todayHours += entryHours;
}
if (entryDate >= weekStart) {
    weekHours += entryHours;
}
if (entryDate >= monthStart) {
    monthHours += entryHours;
}
overtimeHours += entryOvertime;
});

const remainingHours = monthHoursTarget - monthHours;

// Calculate percentages
const todayPercentage = (todayHours / 9) * 100;
const weekPercentage = (weekHours / 40) * 100;
const monthPercentage = (monthHours / monthHoursTarget) * 100;
const remainingPercentage = (remainingHours / monthHoursTarget) * 100;
const overtimePercentage = (overtimeHours / 160) * 100;

// Update text content and progress bar widths
document.getElementById("today-stat").innerText = `${todayHours.toFixed(2)}hr/9hr`;
document.getElementById("week-stat").innerText = `${weekHours.toFixed(2)} hr/40 hr`;
document.getElementById("month-stat").innerText = `${monthHours.toFixed(2)} hr/${monthHoursTarget} hr`;
document.getElementById("remaining-stat").innerText = `${remainingHours.toFixed(2)} hr/${monthHoursTarget} hr`;
document.getElementById("overtime-stat").innerText = `${overtimeHours.toFixed(2)} hr/160 hr`;

document.getElementById("today-progress").style.width = todayPercentage + "%";
document.getElementById("week-progress").style.width = weekPercentage + "%";
document.getElementById("month-progress").style.width = monthPercentage + "%";
document.getElementById("remaining-progress").style.width = remainingPercentage + "%";
document.getElementById("overtime-progress").style.width = overtimePercentage + "%";
}
