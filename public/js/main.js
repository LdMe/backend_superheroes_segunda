// Pide confirmación antes de enviar cualquier formulario que tenga
// el atributo data-confirm, por ejemplo:
//   <form method="post" action="/hero/1/delete" data-confirm="¿Seguro?">
document.querySelectorAll("form[data-confirm]").forEach((form) => {
    form.addEventListener("submit", (e) => {
        const ok = window.confirm(form.dataset.confirm);
        if (!ok) {
            e.preventDefault(); // cancelamos el envío
        }
    });
});
