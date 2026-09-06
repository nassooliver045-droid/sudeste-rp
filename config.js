// Configuração pública do site. Segredos ficam somente no Render.
window.SUDESTE_CONFIG = { API_URL: "/api/wl" };

// O sistema usa o ID numérico do Discord para conseguir enviar o resultado por DM.
document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector('input[name="discord"]');
  const label = input?.closest(".field")?.querySelector("label");
  const hint = input?.closest(".field")?.querySelector(".hint");
  if (input) {
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("pattern", "[0-9]{17,20}");
    input.setAttribute("maxlength", "20");
    input.placeholder = "Ex.: 123456789012345678";
  }
  if (label) label.innerHTML = 'ID do Discord <b>*</b>';
  if (hint) hint.textContent = "Ative o Modo Desenvolvedor no Discord e copie seu ID de usuário. Ele será usado para enviar o resultado por DM.";
});
