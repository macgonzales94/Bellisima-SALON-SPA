function filtrar(tipo) {
    let productos = document.getElementsByClassName("producto");

    for (let i = 0; i < productos.length; i++) {
        if (tipo === "todas") {
            productos[i].style.display = "block";
        } else {
            productos[i].style.display = productos[i].classList.contains(tipo) ? "block" : "none";
        }
    }
}