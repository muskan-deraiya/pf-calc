function togglePF() {

    const pfOption = document.getElementById("pfOption").value;
    const pfSection = document.getElementById("pfSection");
    const empPF = document.getElementById("empPFRow");
    const employerPF = document.getElementById("employerPFRow");

    if (pfOption === "yes") {
        pfSection.style.display = "block";
        empPF.style.display = "block";
        employerPF.style.display = "block";
    } else {
        pfSection.style.display = "none";
        empPF.style.display = "none";
        employerPF.style.display = "none";

        document.getElementById("empPF").innerText = "0";
        document.getElementById("employerPF").innerText = "0";
    }

    calculateFromCTC();
}

function calculateFromCTC() {
    let ctc = parseFloat(document.getElementById("ctc").value) || 0;
    if (ctc === 0) return;

    const pfOption = document.getElementById("pfOption").value;

    let basic = ctc * 0.50;
    let hra = ctc * 0.20;
    let medical = ctc * 0.0333;
    let bonus = ctc * 0.0260;
    let conveyance = ctc * 0.0292;
    let pt = (ctc > 12000) ? 200 : 0;

    let other = ctc - (basic + hra + medical + bonus + conveyance);

    let pf = 0;

    if (pfOption === "yes") {
        if (basic >= 15000) {
            basicpf = 15000;
            pf = basicpf * 0.12;
        }
    }

    document.getElementById("basic").value = basic.toFixed(2);
    document.getElementById("hra").value = hra.toFixed(2);
    document.getElementById("medical").value = medical.toFixed(2);
    document.getElementById("bonus").value = bonus.toFixed(2);
    document.getElementById("conveyance").value = conveyance.toFixed(2);
    document.getElementById("other").value = other.toFixed(2);

    document.getElementById("gross").innerText = ctc.toLocaleString("en-IN");
    document.getElementById("empPF").innerText = pf.toLocaleString("en-IN");
    document.getElementById("employerPF").innerText = pf.toLocaleString("en-IN");
    document.getElementById("professionalTax").innerText = pt.toLocaleString("en-IN");
    document.getElementById("netSal").innerText = (ctc - (pf * 2) - pt).toLocaleString("en-IN");

    document.getElementById("result").style.display = "block";
}

function downloadPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    const pfOption = document.getElementById("pfOption").value;

    const name = document.getElementById("name").value || "";
    const designation = document.getElementById("designation").value || "";
    const department = document.getElementById("department").value || "";
    const uan = pfOption === "yes"
        ? (document.getElementById("uan")?.value || "-")
        : "-";

    const pfno = pfOption === "yes"
        ? (document.getElementById("pfno")?.value || "-")
        : "-";

    const esi = document.getElementById("esi")?.value || "-";
    const bank = document.getElementById("bank")?.value || "-";
    const doj = document.getElementById("doj").value || "";

    const pt = parseFloat(document.getElementById("professionalTax").innerText.replace(/[^0-9.-]+/g, "")) || 0;

    const basic = parseFloat(document.getElementById("basic").value) || 0;
    const hra = parseFloat(document.getElementById("hra").value) || 0;
    const medical = parseFloat(document.getElementById("medical").value) || 0;
    const bonus = parseFloat(document.getElementById("bonus").value) || 0;
    const conveyance = parseFloat(document.getElementById("conveyance").value) || 0;
    const other = parseFloat(document.getElementById("other").value) || 0;

    const gross = basic + hra + medical + bonus + conveyance + other;

    // PF Logic
    let pf = 0;
    if (pfOption === "yes") {
        let pfBasic = (basic >= 15000) ? 15000 : basic;
        pf = pfBasic * 0.12;
    }

    const totalDeductions = (pf * 2) + pt; // Only employee PF
    const netSalary = gross - totalDeductions;

    const format = (num) =>
        "Rs. " + num.toLocaleString("en-IN", { minimumFractionDigits: 2 });

    // Border
    doc.rect(5, 5, 200, 287);

    // Header
    doc.setFillColor(230, 230, 230);
    doc.rect(5, 5, 200, 30, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Your Company Name", pageWidth / 2, 17, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Company Address Line, City, State", pageWidth / 2, 23, { align: "center" });
    doc.text("Salary Slip - " + new Date().toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    }), pageWidth / 2, 28, { align: "center" });

    // Employee Table
    doc.autoTable({
        startY: 40,
        margin: { left: 10 },
        tableWidth: 190,
        theme: "grid",
        styles: { fontSize: 9 },
        body: [
            ["Employee Name", name, "UAN", pfOption === "yes" ? uan : "-"],
            ["Designation", designation, "PF No.", pfOption === "yes" ? pfno : "-"],
            ["Department", department, "ESI No.", esi],
            ["Date of Joining", doj, "Bank A/C", bank]
        ]
    });

    // Earnings & Deductions table body dynamically
    let tableBody = [
        ["Basic", format(basic), pfOption === "yes" ? "EPF (12%)" : "", pfOption === "yes" ? format(pf) : ""],
        ["HRA", format(hra), pfOption === "yes" ? "ERPF (12%)" : "", pfOption === "yes" ? format(pf) : ""],
        ["Medical", format(medical), "Professional Tax", format(pt)],
        ["Bonus", format(bonus), "", ""],
        ["Conveyance", format(conveyance), "", ""],
        ["Other Allowance", format(other), "", ""],
        [{
            content: "Total Earnings",
            styles: { fontStyle: "bold" }
        },
        {
            content: format(gross),
            styles: { fontStyle: "bold", halign: "right" }
        },
        {
            content: "Total Deductions",
            styles: { fontStyle: "bold" }
        },
        {
            content: format(totalDeductions),
            styles: { fontStyle: "bold", halign: "right" }
        }]
    ];

    doc.autoTable({
        startY: (doc.lastAutoTable ? doc.lastAutoTable.finalY : 40) + 10, margin: { left: 10 },
        tableWidth: 190,
        theme: "grid",
        head: [["Earnings", "Amount", "Deductions", "Amount"]],
        styles: { fontSize: 10 },
        headStyles: { fillColor: [210, 210, 210] },
        columnStyles: {
            1: { halign: "right" },
            3: { halign: "right" }
        },
        body: tableBody
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFillColor(240, 240, 240);
    doc.rect(10, finalY, 190, 12, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Net Salary: " + format(netSalary), 195, finalY + 8, { align: "right" });

    doc.line(140, 260, 190, 260);
    doc.setFontSize(9);
    doc.text("Authorized Signatory", 150, 266);

    doc.save("Salary_Slip.pdf");
}
