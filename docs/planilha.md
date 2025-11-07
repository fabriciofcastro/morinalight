/**********\*\*\*\***********\*\*\***********\*\*\*\***********

- CONFIG/CONSTS
  **********\*\*\*\***********\*\*\***********\*\*\*\***********/
  const FOLDER_MIME = "application/vnd.google-apps.folder";
  const SHEET_MIME = "application/vnd.google-apps.spreadsheet";
  const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const MORINA_FOLDER_ID = "13yGkzX8srQjoHY0OSaNeori-Z0hFHQlZ"; // raiz preferencial

/**********\*\*\*\***********\*\*\***********\*\*\*\***********

- MENU
  **********\*\*\*\***********\*\*\***********\*\*\*\***********/
  function onOpen() {
  SpreadsheetApp.getUi()
  .createMenu("🧾 Salva")
  .addItem("💾 Salvar ficha", "abrirModalSalvar")
  .addToUi();
  }

/**********\*\*\*\***********\*\*\***********\*\*\*\***********

- MODAL
  **********\*\*\*\***********\*\*\***********\*\*\*\***********/
  function abrirModalSalvar() {
  const html = HtmlService.createHtmlOutputFromFile("modalSalvar")
  .setWidth(560)
  .setHeight(520);
  SpreadsheetApp.getUi().showModalDialog(html, "💾 Morina");
  }

/**********\*\*\*\***********\*\*\***********\*\*\*\***********

- UTIL (Planilha)
  **********\*\*\*\***********\*\*\***********\*\*\*\***********/
  function mesExtensoPtBrMaiusculo*(d) {
  try {
  return d.toLocaleDateString("pt-BR", { month: "long" }).toUpperCase();
  } catch {
  return ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO",
  "AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"][d.getMonth()];
  }
  }
  function getValor*(sh, a1) {
  const rg = sh.getRange(a1);
  const val = rg.isPartOfMerge() ? rg.getMergedRanges()[0].getDisplayValue() : rg.getDisplayValue();
  return String(val || "").trim();
  }

/**********\*\*\*\***********\*\*\***********\*\*\*\***********

- NOME PADRÃO (para o modal)
  **********\*\*\*\***********\*\*\***********\*\*\*\***********/
  function getNomePadraoArquivo() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const ref = getValor\_(sh, "C5:E5");
  const data = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy");
  return ref ? `${ref} - ${data}` : `- ${data}`;
  }

/**********\*\*\*\***********\*\*\***********\*\*\*\***********

- DRIVE (v3) – helpers
  **********\*\*\*\***********\*\*\***********\*\*\*\***********/
  function driveGetFolderSafe*(id) {
  return Drive.Files.get(id, { fields: "id,name" }); // lança se sem acesso
  }
  function driveListFolders*(parentId) {
  const q = `mimeType='${FOLDER_MIME}' and '${parentId}' in parents and trashed=false`;
  let pageToken = null;
  const out = [];
  do {
  const res = Drive.Files.list({
  q,
  pageToken,
  pageSize: 100,
  includeItemsFromAllDrives: true,
  supportsAllDrives: true,
  fields: "nextPageToken, files(id,name)"
  });
  (res.files || []).forEach(f => out.push({ id: f.id, nome: f.name }));
  pageToken = res.nextPageToken || null;
  } while (pageToken);
  out.sort((a,b)=>a.nome.localeCompare(b.nome,"pt-BR"));
  return out;
  }
  function driveFindOrCreateFolder\_(parentId, name) {
  const q = `mimeType='${FOLDER_MIME}' and '${parentId}' in parents and name='${name.replace(/'/g,"\\'")}' and trashed=false`;
  const res = Drive.Files.list({
  q, pageSize: 1,
  includeItemsFromAllDrives: true,
  supportsAllDrives: true,
  fields: "files(id,name)"
  });
  if (res.files && res.files.length) return res.files[0];
  const created = Drive.Files.create(
  { name, mimeType: FOLDER_MIME, parents: [parentId] },
  null,
  { supportsAllDrives: true, fields: "id,name" }
  );
  return created;
  }

/**********\*\*\*\***********\*\*\***********\*\*\*\***********

- LISTAGEM DE PASTAS (Nível 1 e 2) para o modal
  **********\*\*\*\***********\*\*\***********\*\*\*\***********/
  function listarPastasRaiz() {
  let raiz;
  try { raiz = driveGetFolderSafe*(MORINA_FOLDER_ID); }
  catch (*) { raiz = { id: "root", name: "Meu Drive" }; }

const pastas = [{ id: raiz.id, nome: raiz.name }]; // nível 1 = raiz
const sub = driveListFolders\_(raiz.id); // para selecionar nível 2 no front
const modelagem = sub.find(p => (p.nome || "").toLowerCase() === "modelagem");

return {
pastas, // nível 1
padrao: {
nivel1: raiz.id,
nivel2: modelagem ? modelagem.id : ""
}
};
}
function listarSubpastas(folderId) {
try { return driveListFolders*(folderId); }
catch (*) { return []; }
}

/**********\*\*\*\***********\*\*\***********\*\*\*\***********

- ON EDIT → carimbo inicial + destaque obrigatórios
- NÃO toca em A35:L48 (área de correções)
  **********\*\*\*\***********\*\*\***********\*\*\*\***********/
  function onEdit(e){
  try {
  if (!e || !e.range) return;
  const sh = e.range.getSheet();
  if (!sh || sh.getName() !== "Modelagem") return;

      const dt = sh.getRange("C2:E2");
      if (!String(dt.getDisplayValue()).trim()) {
        dt.setValue(Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss"));
      }

      ["F3","G3","H3"].forEach(c=>{
        sh.getRange(c).setBackground(getValor_(sh,c) ? "#FFFFFF" : "#FFF3CD");
      });

  } catch(\_) {}
  }

/**********\*\*\*\***********\*\*\***********\*\*\*\***********

- Validações (NÃO marca A35:L48 como obrigatório)
  **********\*\*\*\***********\*\*\***********\*\*\*\***********/
  function validarObrigatorios*(sh) {
  const campos = [
  "C2:E2","C3:E3","C4:E4","C5:E5",
  "F3","G3","H3",
  "C7:E7","C8:E8","C9:E9","C10:E10","C11:E11","C12:E12",
  "I4:J4","I5:J5"
  ];
  const faltando = [];
  campos.forEach(r=>{
  const ok = Boolean(getValor*(sh,r));
  sh.getRange(r).setBackground(ok ? "#FFFFFF" : "#FFF3CD");
  if (!ok) faltando.push(r);
  });
  const ref = getValor*(sh,"C5:E5");
  if (!/^\d{5}$/.test(ref)) faltando.push("C5:E5 (5 dígitos)");
  return faltando;
  }
  function validarNumericos*(sh) {
  const checks = [
  { ref:"C7:E7", label:"C7:E7" },
  { ref:"C13:E13", label:"C13:E13" },
  { ref:"I4:J4", label:"I4:J4 (numérico)" }
  ];
  const erros = [];
  checks.forEach(({ref,label})=>{
  if (!/^\d+$/.test(getValor_(sh, ref))) erros.push(`${label} deve conter apenas números`);
  });
  return erros;
  }

/**********\*\*\*\***********\*\*\***********\*\*\*\***********

- LOG / ID
  **********\*\*\*\***********\*\*\***********\*\*\*\***********/
  function prepararControleArquivos*(controle) {
  if (controle.getLastRow() === 0) {
  controle.appendRow(["Data Registro","Referência","Link","Data de Liberação","ID","Categoria","Usuário","Revisão"]);
  controle.getRange("A1:H1")
  .setFontWeight("bold")
  .setBackground("#e5e7eb")
  .setHorizontalAlignment("center");
  controle.setFrozenRows(1);
  }
  }
  function findHeaderColumn*(sheet, headerName) {
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) return null;
  const headers = sheet.getRange(1,1,1,lastCol).getValues()[0];
  for (let i=0;i<headers.length;i++){
  if (String(headers[i]).trim().toLowerCase() === String(headerName).trim().toLowerCase()) return i+1;
  }
  return null;
  }
  function getProximoId*(controle) {
  const colId = findHeaderColumn*(controle, "ID") || 5;
  const lr = controle.getLastRow();
  if (lr <= 1) return 1;
  const ids = controle.getRange(2,colId,lr-1,1).getValues().map(r=>Number(r[0])||0);
  const maxId = ids.reduce((m,v)=>v>m?v:m,0);
  return maxId + 1;
  }

/**********\*\*\*\***********\*\*\***********\*\*\*\***********

- EXPORT + CREATE (FALLBACK SEM SpreadsheetApp.create)
- - Exporta a planilha atual para XLSX (Drive export)
- - Faz upload como Google Sheet (conversão) com Drive.Files.create
    **********\*\*\*\***********\*\*\***********\*\*\*\***********/
    function fallbackExportAndCreate\_(srcFileId, targetFolderId, nomeArquivo) {
    // Exporta via HTTP (evita limitações do método bound em Advanced Drive)
    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(srcFileId)}/export?mimeType=${encodeURIComponent(XLSX_MIME)}`;
    const resp = UrlFetchApp.fetch(url, {
    method: "get",
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    muteHttpExceptions: false
    });
    const xlsxBlob = resp.getBlob().setName(`${nomeArquivo}.xlsx`);

// Cria uma Google Sheet a partir do XLSX (conversão automática)
const file = Drive.Files.create(
{ name: nomeArquivo, mimeType: SHEET_MIME, parents: [targetFolderId] },
xlsxBlob,
{ supportsAllDrives: true, fields: "id,webViewLink" }
);
return { fileId: file.id, url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit` };
}

/**********\*\*\*\***********\*\*\***********\*\*\*\***********

- CÓPIA COM FALLBACK
  **********\*\*\*\***********\*\*\***********\*\*\*\***********/
  function copySpreadsheetWithFallback*(srcSpreadsheet, targetFolderId, nomeArquivo) {
  // 1) Tenta copy nativo (se o usuário puder copiar o arquivo)
  try {
  const copy = Drive.Files.copy(
  { name: nomeArquivo, parents: [ targetFolderId ] },
  srcSpreadsheet.getId(),
  { supportsAllDrives: true, fields: "id,webViewLink" }
  );
  return { fileId: copy.id, url: copy.webViewLink || `https://docs.google.com/spreadsheets/d/${copy.id}/edit` };
  } catch (err) {
  // 2) Fallback por exportação+conversão (sem SpreadsheetApp.create)
  return fallbackExportAndCreate*(srcSpreadsheet.getId(), targetFolderId, nomeArquivo);
  }
  }

/**********\*\*\*\***********\*\*\***********\*\*\*\***********

- CRIAR CAMINHO ano/mês/ref
  **********\*\*\*\***********\*\*\***********\*\*\*\***********/
  function ensurePath*(baseFolderId, agora, refBase) {
  const tz = Session.getScriptTimeZone();
  const anoNome = Utilities.formatDate(agora, tz, "yyyy");
  const mesNome = mesExtensoPtBrMaiusculo*(agora);

const ano = driveFindOrCreateFolder*(baseFolderId, anoNome);
const mes = driveFindOrCreateFolder*(ano.id, mesNome);
const pastaRef = driveFindOrCreateFolder\_(mes.id, refBase);

return { ano, mes, pastaRef };
}

/**********\*\*\*\***********\*\*\***********\*\*\*\***********

- SALVAR (chamado pelo modal)
- - A35:L48 permanece editável; limpa ao salvar
    **********\*\*\*\***********\*\*\***********\*\*\*\***********/
    function salvarCopia(folderId) {
    try {
    const ss = SpreadsheetApp.getActive();
    const sh = ss.getSheetByName("Modelagem");
    if (!sh) return "⚠️ Abra a aba 'Modelagem'.";
    if (!folderId) return "⚠️ Selecione uma pasta de destino.";

          const tz = Session.getScriptTimeZone();
          const agora = new Date();

          // Timestamp garantido
          sh.getRange("C2:E2").setValue(Utilities.formatDate(agora, tz, "dd/MM/yyyy HH:mm:ss"));

          // Validações
          const faltando = validarObrigatorios_(sh);
          if (faltando.length) return `⚠️ Preencha:\n- ${faltando.join("\n- ")}`;
          const errosN = validarNumericos_(sh);
          if (errosN.length) return `⚠️ Ajuste:\n- ${errosN.join("\n- ")}`;

          // Base
          const refBase  = getValor_(sh, "C5:E5").replace(/\D/g, "").slice(0,5);
          const categoria= getValor_(sh, "C3:E3");
          const dataLib  = getValor_(sh, "C2:E2");
          const usuario  = Session.getActiveUser().getEmail() || "Usuário";

          // Correção? (SOMENTE A35:L48)
          const temCorrecao = sh.getRange("A35:L48").getDisplayValues()
            .flat()
            .some(v => String(v).trim() !== "");

          // LOG
          const controle = ss.getSheetByName("Controle de Arquivos") || ss.insertSheet("Controle de Arquivos");
          prepararControleArquivos_(controle);

          // Checar referência existente
          let linhaExistente = null;
          const lr = controle.getLastRow();
          if (lr > 1) {
            const vals = controle.getRange(2, 2, lr - 1, 1).getValues();
            for (let i = 0; i < vals.length; i++) {
              if (String(vals[i][0] || "").trim() === refBase) { linhaExistente = 2 + i; break; }
            }
          }

          if (linhaExistente && !temCorrecao) return "⚠️ Já existe uma ficha com esta Referência no log.";

          // ID
          const idRange = sh.getRange("J2:J3");
          let idFinal;
          if (linhaExistente) {
            const colId = findHeaderColumn_(controle, "ID") || 5;
            idFinal = Number(controle.getRange(linhaExistente, colId).getValue()) || 0;
          } else {
            idFinal = getProximoId_(controle);
          }
          idRange.setValues([[idFinal],[idFinal]]).setBackground("#FFFFFF").setFontColor("#000000");

          // Revisão
          let revisao = 0;
          if (linhaExistente) {
            const colRev = findHeaderColumn_(controle, "Revisão") || 8;
            const v = Number(controle.getRange(linhaExistente, colRev).getValue()) || 0;
            revisao = temCorrecao ? (v + 1) : v;
          }

          const refDisplay = (temCorrecao && revisao > 0) ? `${refBase}-R${revisao}` : refBase;
          const nomeArquivo = `${refDisplay} - ${Utilities.formatDate(agora, tz, "dd-MM-yyyy")}`;

          // Pasta destino base (valida ID; se inválido, cai para root)
          let baseFolderId = folderId;
          try { driveGetFolderSafe_(folderId); } catch (_) { baseFolderId = "root"; }

          // Caminho ano/mês/ref
          const { ano, mes, pastaRef } = ensurePath_(baseFolderId, agora, refBase);

          // Copiar com fallback (sem SpreadsheetApp.create)
          const { fileId, url } = copySpreadsheetWithFallback_(ss, pastaRef.id, nomeArquivo);

          // Atualiza LOG
          const dataRegistro = Utilities.formatDate(agora, tz, "dd/MM/yyyy HH:mm");
          if (linhaExistente && temCorrecao) {
            controle.getRange(linhaExistente, 1, 1, 8).setValues([[
              dataRegistro, refBase, "", dataLib, String(idFinal), categoria, usuario, revisao
            ]]);
            controle.getRange(linhaExistente, 3).setFormula(`=HYPERLINK("${url}";"Abrir Ficha")`);
          } else {
            controle.appendRow([dataRegistro, refBase, "", dataLib, String(idFinal), categoria, usuario, revisao]);
            const lr2 = controle.getLastRow();
            controle.getRange(lr2, 3).setFormula(`=HYPERLINK("${url}";"Abrir Ficha")`);
          }

          /******** Limpeza pós-salvar ********/
          const limparCamposObrig = [
            "C2:E2","C3:E3","C4:E4","C5:E5",
            "F3","G3","H3",
            "C7:E7","C8:E8","C9:E9","C10:E10","C11:E11","C12:E12",
            "I5:J5","I4:J4","C13:E13"
          ];
          limparCamposObrig.forEach(a1 => sh.getRange(a1).clearContent().setBackground("#FFFFFF"));
          sh.getRange("A17:L32").clearContent();
          sh.getRange("A35:L48").clearContent(); // limpa a área de correções ao salvar
          sh.getRange("K3:L13").clearContent().setBackground("#FFFFFF");

          return `✅ Ficha salva com sucesso!

    🔢 ID: ${idFinal}${revisao>0?` (R${revisao})`:""}
    📁 Pasta: ${ano.name}/${mes.name}/${refBase}
    🔗 Abrir Ficha`;
} catch (e) {
  return `❌ Erro: ${e.message}`;
    }
    }

/_ html _/

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <base target="_top">
  <style>
    body{background:#ffffff;color:#111827;font-family:Inter,Arial,sans-serif;padding:20px;margin:0}
    h2{margin:0 0 16px 0;color:#111827;font-size:18px;font-weight:600}
    .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px}
    label{display:block;margin-top:12px;font-size:13px;color:#374151}
    input,select{width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;background:#ffffff;color:#111827;font-size:14px;margin-top:4px;box-sizing:border-box}
    input:focus,select:focus{border-color:#2563eb;outline:none;box-shadow:0 0 0 3px rgba(37,99,235,.15)}
    .btn{margin-top:18px;padding:10px 18px;font-weight:600;border:1px solid #1f2937;border-radius:8px;cursor:pointer;background:#111827;color:#fff;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%}
    .btn[disabled]{opacity:.6;cursor:not-allowed}
    .status{margin-top:14px;min-height:26px;font-size:13px}
    .pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;margin-left:8px;border:1px solid #d1d5db;color:#374151;background:#fff}
    .spinner{width:16px;height:16px;border:2px solid rgba(0,0,0,.15);border-top-color:#111827;border-radius:50%;animation:spin 1s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
  </style>
</head>
<body>
  <h2>💾 Salvar Ficha <span class="pill">Meu Drive / Morina</span></h2>
  <div class="card">
    <label>Nome do arquivo</label>
    <input id="nomeArquivo" readonly>

    <label style="margin-top:16px">Nível 1 (Raiz)</label>
    <select id="nivel1"></select>

    <label>Nível 2 (Subpasta)</label>
    <select id="nivel2" disabled></select>

    <button id="btnSalvar" class="btn" onclick="salvar()">
      <span id="iconSalvar">💾</span>
      <span id="txtSalvar">Salvar</span>
    </button>

    <div id="status" class="status"></div>

  </div>

  <script>
    const nomeArquivoEl = document.getElementById("nomeArquivo");
    const nivel1 = document.getElementById("nivel1");
    const nivel2 = document.getElementById("nivel2");
    const btn = document.getElementById("btnSalvar");
    const statusEl = document.getElementById("status");
    const iconSalvar = document.getElementById("iconSalvar");
    const txtSalvar = document.getElementById("txtSalvar");

    function setStatus(msg, type="ok"){
      const color = type==="err"?"#b91c1c":type==="warn"?"#92400e":"#065f46";
      const bg = type==="err"?"#fee2e2":type==="warn"?"#fef3c7":"#dcfce7";
      statusEl.innerHTML =
        `<div style="padding:10px 12px;border-left:4px solid ${color};border-radius:6px;background:${bg};color:#111827">${msg}</div>`;
    }
    function setLoading(on){
      if(on){
        iconSalvar.innerHTML = '<span class="spinner"></span>';
        txtSalvar.textContent = "Salvando…";
        btn.disabled = true;
      } else {
        iconSalvar.textContent = "💾";
        txtSalvar.textContent = "Salvar";
        btn.disabled = false;
      }
    }

    // Nome padrão e níveis
    (function init(){
      google.script.run
        .withSuccessHandler(n => nomeArquivoEl.value = n)
        .withFailureHandler(() => nomeArquivoEl.value = "")
        .getNomePadraoArquivo();

      google.script.run
        .withSuccessHandler(res => {
          const pastas = res?.pastas || [];
          const padrao = res?.padrao || {};
          nivel1.innerHTML = "";
          pastas.forEach(p => {
            const o = document.createElement("option");
            o.value = p.id; o.textContent = p.nome;
            nivel1.appendChild(o);
          });
          if (padrao.nivel1) nivel1.value = padrao.nivel1;

          if (padrao.nivel1) {
            google.script.run.withSuccessHandler(subs => {
              nivel2.innerHTML = "";
              subs.forEach(s => {
                const o = document.createElement("option");
                o.value = s.id; o.textContent = s.nome;
                nivel2.appendChild(o);
              });
              if (padrao.nivel2) nivel2.value = padrao.nivel2;
              nivel2.disabled = false;
            }).listarSubpastas(padrao.nivel1);
          }
        })
        .withFailureHandler(err => setStatus("❌ Falha ao listar pastas: " + (err?.message || err), "err"))
        .listarPastasRaiz();
    })();

    // Troca do Nível 1 → recarrega Nível 2
    nivel1.addEventListener("change", () => {
      const id = nivel1.value;
      nivel2.disabled = true;
      nivel2.innerHTML = "";
      if (!id) return;
      google.script.run.withSuccessHandler(subs => {
        subs.forEach(s => {
          const o = document.createElement("option");
          o.value = s.id; o.textContent = s.nome;
          nivel2.appendChild(o);
        });
        nivel2.disabled = false;
      }).listarSubpastas(id);
    });

    function salvar() {
      const folderId = nivel2.value || nivel1.value;
      if (!folderId) return setStatus("⚠️ Selecione uma pasta de destino.", "warn");

      setLoading(true);
      setStatus("⏳ Validando e salvando…", "warn");

      google.script.run
        .withSuccessHandler(res => {
          setLoading(false);
          if (typeof res === "string" && res.startsWith("✅")) {
            setStatus(res.replace(/\n/g,"<br>"), "ok");
            setTimeout(() => google.script.host.close(), 3000);
          } else {
            setStatus(res ? res.replace(/\n/g,"<br>") : "Falha ao salvar.", "warn");
          }
        })
        .withFailureHandler(err => {
          setLoading(false);
          setStatus("❌ " + (err?.message || "Erro desconhecido"), "err");
        })
        .salvarCopia(folderId);
    }
  </script>
</body>
</html>
