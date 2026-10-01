/**
 * BACKEND API DEFINITIV PENTRU DIiH HUB v17
 * Autor: Bogdan Murar (Z003FU5C) & DevPilot
 * Păstrează compatibilitatea 100% cu structura existentă a taburilor din Google Sheets
 */

const API_SECURITY_TOKEN = "diih_secret_2026_bm";
const SPREADSHEET_ID = "107cZOxLdMMTuOsytriNmZt_d3FM0Nwz1z2ykzpnCcfY";

function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

function doGet(e) {
  const token = e.parameter.token;
  if (token !== API_SECURITY_TOKEN) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Acces neautorizat!" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const ss = getSpreadsheet();
  const action = e.parameter.action;

  // 1. AUDIT AVANSAT ÎN LOG_Sistem
  if (action === "logEvent") {
    logToSystemSheet(ss, {
      categorie: e.parameter.category || "AUDIT_APP",
      runId: e.parameter.runId || "-",
      sursa: e.parameter.deviceName || e.parameter.deviceId || "App",
      modul: e.parameter.entity || "General",
      actiune: e.parameter.appAction || "-",
      status: e.parameter.status || "INFO",
      detalii: e.parameter.message || "",
      eroare: e.parameter.errorMessage || "",
      stack: e.parameter.stack || ""
    });
    return returnResponse(e, { success: true });
  }

  // 2. SETĂRI GLOBALE (Inclusiv Număr Persoane Pomelnic Zilnic)
  if (action === "updateGlobalSettings") {
    let sh = ss.getSheetByName("Setari");
    if (!sh) {
      sh = ss.insertSheet("Setari");
      sh.appendRow(["Cheie", "Valoare", "UltimaModificare"]);
      sh.getRange("A1:C1").setFontWeight("bold");
    }
    if (e.parameter.appTitle) setSettingValue(sh, "app_title", e.parameter.appTitle);
    if (e.parameter.appLogo) setSettingValue(sh, "app_logo", e.parameter.appLogo);
    if (e.parameter.pomelnicBatchSize) setSettingValue(sh, "pomelnic_batch_size", e.parameter.pomelnicBatchSize);
    if (e.parameter.psaltireBatchSize) setSettingValue(sh, "psaltire_batch_size", e.parameter.psaltireBatchSize);
    return returnResponse(e, { success: true });
  }

  // 3. SALVARE ACTIVITĂȚI ȘCOALĂ (Păstrează structura de 14 coloane a foii existente)
  if (action === "saveSchoolActivities") {
    let sh = ss.getSheetByName("Scoala_Activitati") || ss.getSheetByName("Activitati_Scoala");
    if (!sh) {
      sh = ss.insertSheet("Activitati_Scoala");
      sh.appendRow(["ID", "Data", "Copil", "Institutie", "Titlu", "TipPlata", "Ore", "TarifOra", "TotalPlata", "StatusPlata", "TermenPlata", "MesajZi", "RemindereJson", "DataCreare"]);
      sh.getRange("A1:N1").setFontWeight("bold");
    }
    const activities = JSON.parse(e.parameter.data || "[]");
    const dataCreare = Utilities.formatDate(new Date(), "Europe/Bucharest", "yyyy-MM-dd HH:mm:ss");

    activities.forEach(item => {
      deleteRowById(sh, item.id, 1);
      sh.appendRow([
        item.id,
        item.date,
        item.child || "Copil",
        item.institution || "-",
        item.title,
        item.paymentType || "Pe oră",
        item.hours || 1,
        item.rate || 0,
        item.total || 0,
        item.paymentStatus || "În așteptare",
        item.deadline || "-",
        item.dayMessage || "",
        JSON.stringify(item.reminders || []),
        dataCreare
      ]);
    });
    return returnResponse(e, { success: true, count: activities.length });
  }

  if (action === "deleteSchoolActivity") {
    let sh = ss.getSheetByName("Scoala_Activitati") || ss.getSheetByName("Activitati_Scoala");
    if (sh && e.parameter.id) deleteRowById(sh, e.parameter.id, 1);
    return returnResponse(e, { success: true });
  }

  // Actualizare în calup status plată (pentru restanțe rezolvate direct din sumar)
  if (action === "batchUpdateSchoolStatus") {
    let sh = ss.getSheetByName("Scoala_Activitati") || ss.getSheetByName("Activitati_Scoala");
    const ids = JSON.parse(e.parameter.ids || "[]");
    const newStatus = e.parameter.status || "Achitat";
    if (sh && ids.length > 0) {
      const maxRows = sh.getLastRow();
      if (maxRows >= 2) {
        const idCol = sh.getRange(2, 1, maxRows - 1, 1).getValues();
        for (let i = 0; i < idCol.length; i++) {
          if (ids.indexOf(String(idCol[i][0]).trim()) !== -1) {
            sh.getRange(i + 2, 10).setValue(newStatus); // Col J = StatusPlata
          }
        }
      }
    }
    return returnResponse(e, { success: true });
  }

  // 4. CRUD FOAIA Psaltire_Grup
  if (action === "addPsaltirePerson") {
    let sh = ss.getSheetByName("Psaltire_Grup");
    if (!sh) {
      sh = ss.insertSheet("Psaltire_Grup");
      sh.appendRow(["Sectiune", "Subgrup_Coloana", "Numar_Rand", "Catisma", "Persoana_Raw", "Exclus_La_Pomenire"]);
      sh.getRange("A1:F1").setFontWeight("bold");
    }
    sh.appendRow([
      e.parameter.sectiune || "Grup Psaltire",
      e.parameter.subgrup || "Coloana 1",
      parseInt(e.parameter.numarRand, 10) || sh.getLastRow(),
      e.parameter.catisma || "",
      e.parameter.nume,
      e.parameter.exclus === "true" ? "DA" : "NU"
    ]);
    return returnResponse(e, { success: true });
  }

  if (action === "updatePsaltirePerson") {
    let sh = ss.getSheetByName("Psaltire_Grup");
    let rowId = parseInt(e.parameter.rowId, 10);
    if (sh && rowId >= 2 && rowId <= sh.getLastRow()) {
      if (e.parameter.nume) sh.getRange(rowId, 5).setValue(e.parameter.nume);
      if (e.parameter.sectiune) sh.getRange(rowId, 1).setValue(e.parameter.sectiune);
      if (e.parameter.subgrup) sh.getRange(rowId, 2).setValue(e.parameter.subgrup);
      if (e.parameter.catisma) sh.getRange(rowId, 4).setValue(e.parameter.catisma);
      if (e.parameter.exclus !== undefined) sh.getRange(rowId, 6).setValue(e.parameter.exclus === "true" ? "DA" : "NU");
      return returnResponse(e, { success: true });
    }
  }

  if (action === "deletePsaltirePerson") {
    let sh = ss.getSheetByName("Psaltire_Grup");
    let rowId = parseInt(e.parameter.rowId, 10);
    if (sh && rowId >= 2 && rowId <= sh.getLastRow()) {
      sh.deleteRow(rowId);
      return returnResponse(e, { success: true });
    }
  }

  // 5. GÂNDURI
  if (action === "addGand") {
    let sh = ss.getSheetByName("Ganduri");
    if (!sh) {
      sh = ss.insertSheet("Ganduri");
      sh.appendRow(["Gand", "Sursa", "Data"]);
      sh.getRange("A1:C1").setFontWeight("bold");
    }
    sh.appendRow([
      e.parameter.gand,
      e.parameter.sursa || "Personal",
      Utilities.formatDate(new Date(), "Europe/Bucharest", "yyyy-MM-dd HH:mm:ss")
    ]);
    return returnResponse(e, { success: true });
  }

  if (action === "updateGand") {
    let sh = ss.getSheetByName("Ganduri");
    let rowId = parseInt(e.parameter.rowId, 10);
    if (sh && rowId >= 2 && rowId <= sh.getLastRow()) {
      sh.getRange(rowId, 1).setValue(e.parameter.gand);
      sh.getRange(rowId, 2).setValue(e.parameter.sursa);
      return returnResponse(e, { success: true });
    }
  }

  if (action === "deleteGand") {
    let sh = ss.getSheetByName("Ganduri");
    let rowId = parseInt(e.parameter.rowId, 10);
    if (sh && rowId >= 2 && rowId <= sh.getLastRow()) {
      sh.deleteRow(rowId);
      return returnResponse(e, { success: true });
    }
  }

  // 6. CUMPĂRĂTURI
  if (action === "addCumparaturi") {
    let sh = ss.getSheetByName("lista_cumparaturi");
    if (!sh) {
      sh = ss.insertSheet("lista_cumparaturi");
      sh.appendRow(["Magazin", "Produs", "Cantitate"]);
      sh.getRange("A1:C1").setFontWeight("bold");
    }
    sh.appendRow([e.parameter.magazin || "General", e.parameter.produs, e.parameter.cantitate || "1"]);
    return returnResponse(e, { success: true });
  }

  if (action === "deleteCumparaturi") {
    let sh = ss.getSheetByName("lista_cumparaturi");
    let rowId = parseInt(e.parameter.rowId, 10);
    if (sh && rowId >= 2 && rowId <= sh.getLastRow()) {
      sh.deleteRow(rowId);
      return returnResponse(e, { success: true });
    }
  }

  if (action === "deleteMagazinCumparaturi") {
    let sh = ss.getSheetByName("lista_cumparaturi");
    const magazin = e.parameter.magazin;
    if (sh && magazin && sh.getLastRow() >= 2) {
      const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
      for (let i = vals.length - 1; i >= 0; i--) {
        if (vals[i][0] && vals[i][0].toString().trim() === magazin.toString().trim()) {
          sh.deleteRow(i + 2);
        }
      }
    }
    return returnResponse(e, { success: true });
  }

  // 7. EDITARE PERSOANĂ POMELNIC
  if (action === "updatePerson") {
    let sh = ss.getSheetByName("Pomelnic");
    let rowId = parseInt(e.parameter.rowId, 10);
    if (sh && rowId >= 2 && rowId <= sh.getLastRow()) {
      if (e.parameter.prenume !== undefined) sh.getRange(rowId, 5).setValue(e.parameter.prenume);
      if (e.parameter.nume !== undefined) sh.getRange(rowId, 6).setValue(e.parameter.nume);
      if (e.parameter.info !== undefined) sh.getRange(rowId, 7).setValue(e.parameter.info);
      if (e.parameter.stare !== undefined) sh.getRange(rowId, 14).setValue(e.parameter.stare);
      if (e.parameter.grad !== undefined) sh.getRange(rowId, 15).setValue(e.parameter.grad);
      if (e.parameter.necesitaAtentie !== undefined) {
        const valBool = (e.parameter.necesitaAtentie === "true" || e.parameter.necesitaAtentie === true);
        sh.getRange(rowId, 22).setValue(valBool);
      }
      return returnResponse(e, { success: true });
    }
  }

  // 8. SALVARE CONFIGURĂRI NOTIFICĂRI ÎN SHEET
  if (action === "saveNotificationConfigs") {
    let sh = ss.getSheetByName("Setari");
    if (!sh) {
      sh = ss.insertSheet("Setari");
      sh.appendRow(["Cheie", "Valoare", "UltimaModificare"]);
    }
    setSettingValue(sh, "notifications_config_json", e.parameter.configJson);
    return returnResponse(e, { success: true });
  }

  // 9. PRELUARE COMPLETĂ DATE PENTRU APLICAȚIE (RĂSPUNS 1:1)
  const responseData = {
    settings: getSettingsData(ss),
    pomelnic: getPomelnicData(ss),
    cumparaturi: getCumparaturiData(ss),
    ganduri: getGanduriData(ss),
    noteAnania: getNoteAnaniaData(ss),
    bibliaBVA: getBiblia360Data(ss),
    schoolActivities: getSchoolActivitiesData(ss),
    psaltireGrup: getPsaltireGrupData(ss)
  };

  return returnResponse(e, responseData);
}

function returnResponse(e, data) {
  const callback = e.parameter.callback;
  if (callback && callback !== "void") {
    return ContentService.createTextOutput(`${callback}(${JSON.stringify(data)})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSettingsData(ss) {
  let sh = ss.getSheetByName("Setari");
  let cfg = { appTitle: "DIiH Hub", appLogo: "🧭", pomelnicBatchSize: 20, psaltireBatchSize: 20, notificationsJson: "" };
  if (!sh || sh.getLastRow() < 2) return cfg;
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues();
  rows.forEach(r => {
    let k = (r[0] || "").toString().trim();
    let v = r[1];
    if (k === "app_title" && v) cfg.appTitle = v.toString();
    if (k === "app_logo" && v) cfg.appLogo = v.toString();
    if (k === "pomelnic_batch_size" && v) cfg.pomelnicBatchSize = parseInt(v, 10) || 20;
    if (k === "psaltire_batch_size" && v) cfg.psaltireBatchSize = parseInt(v, 10) || 20;
    if (k === "notifications_config_json" && v) cfg.notificationsJson = v.toString();
  });
  return cfg;
}

function setSettingValue(sheet, key, value) {
  if (value === undefined || value === null) return;
  const maxRows = sheet.getLastRow();
  const timestamp = Utilities.formatDate(new Date(), "Europe/Bucharest", "yyyy-MM-dd HH:mm:ss");
  if (maxRows >= 2) {
    const keys = sheet.getRange(2, 1, maxRows - 1, 1).getValues();
    for (let i = 0; i < keys.length; i++) {
      if (keys[i][0] && keys[i][0].toString().trim() === key) {
        sheet.getRange(i + 2, 2, 1, 2).setValues([[value, timestamp]]);
        return;
      }
    }
  }
  sheet.appendRow([key, value, timestamp]);
}

function getBiblia360Data(ss) {
  let sh = ss.getSheetByName("Biblia 360 zile BVA") || ss.getSheetByName("Biblia_360_zile_BVA");
  if (!sh || sh.getLastRow() < 2) return [];
  const rows = sh.getRange(2, 1, Math.min(sh.getLastRow() - 1, 365), 7).getValues();
  return rows.map(r => ({
    ziua: r[1],
    tip: r[2],
    cartea: r[3],
    capitol: r[4],
    combo: r[5]
  })).filter(x => x.cartea);
}

function getSchoolActivitiesData(ss) {
  let sh = ss.getSheetByName("Scoala_Activitati") || ss.getSheetByName("Activitati_Scoala");
  if (!sh || sh.getLastRow() < 2) return [];
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 14).getValues();
  return rows.map(r => ({
    id: r[0],
    date: r[1],
    child: r[2] || "Copil",
    institution: r[3] || "-",
    title: r[4] || "Activitate",
    paymentType: r[5] || "Pe oră",
    hours: parseFloat(r[6]) || 1,
    rate: parseFloat(r[7]) || 0,
    total: parseFloat(r[8]) || 0,
    paymentStatus: r[9] || "În așteptare",
    deadline: r[10] || "-",
    dayMessage: r[11] || "",
    reminders: parseJsonSafe(r[12])
  }));
}

function parseJsonSafe(val) {
  try { return JSON.parse(val || "[]"); } catch (e) { return []; }
}

function getPsaltireGrupData(ss) {
  let sh = ss.getSheetByName("Psaltire_Grup");
  if (!sh || sh.getLastRow() < 2) return [];
  const maxRows = sh.getLastRow();
  const rows = sh.getRange(2, 1, maxRows - 1, 6).getValues();
  return rows.map((r, i) => ({
    rowId: i + 2,
    sectiune: (r[0] || "Grup Psaltire").toString().trim(),
    subgrupColoana: (r[1] || "").toString().trim(),
    numarRand: r[2] || (i + 1),
    catisma: (r[3] || "").toString().trim(),
    persoanaRaw: (r[4] || "").toString().trim(),
    exclusLaPomenire: (r[5] || "").toString().trim().toUpperCase() === "DA"
  })).filter(x => x.persoanaRaw !== "");
}

function getPomelnicData(ss) {
  const sh = ss.getSheetByName("Pomelnic");
  if (!sh || sh.getLastRow() < 2) return [];
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 22).getValues();
  let list = [];
  rows.forEach((r, idx) => {
    let prenume = (r[4] || "").toString().trim();
    let nume = (r[5] || "").toString().trim();
    if (!prenume && !nume) return;
    
    let valC = r[2];
    let isActivPomelnic = (valC === true || valC === "TRUE" || valC === "true" || valC === 1 || valC === "1");
    
    let valV = r[21];
    let necesitaAtentie = (valV === true || valV === "TRUE" || valV === "true" || valV === 1 || valV === "1");

    list.push({
      rowId: idx + 2,
      isActivPomelnic: isActivPomelnic,
      necesitaAtentie: necesitaAtentie,
      prenume: prenume,
      nume: nume,
      info: (r[6] || "").toString().trim(),
      dn: parseDateToText(r[8]),
      da: parseDateToText(r[10]),
      stare: (r[13] || "Viu").toString().trim(),
      grad: (r[14] || "").toString().trim()
    });
  });
  return list;
}

function getCumparaturiData(ss) {
  const sh = ss.getSheetByName("lista_cumparaturi");
  if (!sh || sh.getLastRow() < 2) return [];
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
  return rows.map((r, i) => ({
    rowId: i + 2,
    magazin: r[0] || "General",
    produs: r[1] || "",
    cantitate: r[2] || "1"
  })).filter(x => x.produs);
}

function getGanduriData(ss) {
  const sh = ss.getSheetByName("Ganduri");
  if (!sh || sh.getLastRow() < 2) return [];
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
  return rows.map((r, i) => ({
    rowId: i + 2,
    gand: r[0] || "",
    sursa: r[1] || "Personal",
    data: r[2] ? parseDateToText(r[2]) : ""
  })).filter(x => x.gand);
}

function getNoteAnaniaData(ss) {
  const sh = ss.getSheetByName("noteBIBLIA_Anania");
  if (!sh || sh.getLastRow() < 2) return [];
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues();
  return rows.map(r => ({ cartea: r[0], versetul: r[1], indice: r[2], explicatie: r[3] })).filter(x => x.cartea);
}

function deleteRowById(sheet, targetVal, colIndex) {
  const maxRows = sheet.getLastRow();
  if (maxRows < 2) return;
  const values = sheet.getRange(2, colIndex, maxRows - 1, 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i][0] && values[i][0].toString().trim() === targetVal.toString().trim()) {
      sheet.deleteRow(i + 2);
    }
  }
}

function logToSystemSheet(ss, d) {
  let sh = ss.getSheetByName("LOG_Sistem");
  if (!sh) {
    sh = ss.insertSheet("LOG_Sistem");
    sh.appendRow(["Timestamp", "CategorieLog", "RunId_Sesiune", "Dispozitiv_Sursa", "Modul", "Actiune", "Status", "DetaliiModificare", "MesajEroare", "StackTrace"]);
    sh.getRange("A1:J1").setFontWeight("bold");
  }
  const timestamp = Utilities.formatDate(new Date(), "Europe/Bucharest", "yyyy-MM-dd HH:mm:ss");
  sh.appendRow([
    timestamp,
    d.categorie || "AUDIT_APP",
    d.runId || "-",
    d.sursa || "Browser",
    d.modul || "General",
    d.actiune || "-",
    d.status || "INFO",
    d.detalii || "",
    d.eroare || "",
    d.stack || ""
  ]);
  if (sh.getLastRow() > 2000) sh.deleteRows(2, 500);
}

function parseDateToText(val) {
  if (!val) return "";
  if (Object.prototype.toString.call(val) === '[object Date]') {
    return Utilities.formatDate(val, "Europe/Bucharest", "dd.MM.yyyy");
  }
  return val.toString().trim();
}