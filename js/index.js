//CDBL

//definicion constantes de id para manipulacion
const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');
//definicion de templetes 
const templateCard = document.getElementById('template-card').content;
const templateCarrito = document.getElementById('template-carrito').content;
const templateFooter = document.getElementById('template-footer').content;

const fragment = document.createDocumentFragment();

let carrito = {};//guarda los productos de la card

document.addEventListener('DOMContentLoaded', () => {
    fetcData();
    //uso del local storage para mantener los productos al actualizar
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'));
        pintarCarrito();
    }
});

//detectar boton comprar
cards.addEventListener('click', e => {
    agregarCarrito(e);
});
//detectar botones carrito
items.addEventListener('click', e => {
    btnAccion(e);
});

//Funcion para uso de fetch para llamar el arreglo de datos .json
const fetcData = async () => {
    try {
        const res = await fetch('../js/productos.json');
        const data = await res.json();
        pintarCards(data);
    } catch (error) {
        console.log(error);
    }
}

//funcion para pintar cards de productos
const pintarCards = data => {
    data.forEach(producto => {
        templateCard.querySelector('img').setAttribute("src", producto.img);//Establece el valor de un atributo en el elemento indicado. 
        templateCard.querySelector('h4').textContent = producto.tipoComponente;
        templateCard.querySelector('h5').textContent = producto.marca;
        templateCard.querySelector('h6').textContent = producto.descripcion;
        templateCard.querySelector('p').textContent = producto.precio;
        //boton comprar
        templateCard.querySelector('.btn-dark').dataset.id = producto.id;//vincular el boton con el erspectivo id de producto

        const clone = templateCard.cloneNode(true);//clona todos los atrubutos y sus valores
        fragment.appendChild(clone);
    });
    cards.appendChild(fragment);//evitar el reflow
}

//funcion para agregar productos al carrito detectando el boton
const agregarCarrito = e =>{
    if (e.target.classList.contains('btn-dark')) {
        Toastify({
            text: "Se agrego 1 articulo al carrito!!",
            duration: 3000,
            gravity: 'top',
            position: 'right'
        }).showToast();
        setCarrito(e.target.parentElement);
    }
    e.stopPropagation();//detener cualquier otro evento generado en items 
}

//obtener el id del producto para agregar cantidades iniciando en 1
const setCarrito = objeto => {
    const producto = {
        id: objeto.querySelector('.btn-dark').dataset.id,
        tipoComponente: objeto.querySelector('h4').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1
    }

    //devuelve un booleano indicando si el objeto tiene la propiedad especificada.
    if (carrito.hasOwnProperty(producto.id)){
        //aumentar cantidad
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }

    //adquiero la informacion y realizo una copia de producto
    carrito[producto.id] = {...producto}
    pintarCarrito();
}

//pintar en el carrito
const pintarCarrito = () => {
    items.innerHTML = '';
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id;
        templateCarrito.querySelectorAll('td')[0].textContent = producto.tipoComponente;
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio;

        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);
    });
    items.appendChild(fragment);

    pintarFooter();

    //localstorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

//pintar footer
const pintarFooter = () => {
    footer.innerHTML = '';
    if(Object.keys(carrito).length === 0) {
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
        `
        return;
    }

    const nCantidad = Object.values(carrito).reduce((acc, {cantidad}) => acc + cantidad,0 );
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio,0);
    
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
    templateFooter.querySelector('span').textContent = nPrecio;

    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);

    // vaciar carrito 
    const btnVaciar = document.getElementById('vaciar-carrito')
    btnVaciar.addEventListener('click', () => {

        //se agrega la libreria Sweet Alert 2 para conprobar si se elimina el producto
        Swal.fire({
            icon: 'warning',
            title: "¿Está seguro de eliminar los productos del carrtio?",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        })
        .then(resultado => {
            if (resultado.value) {
                // Hicieron click en "Sí"
                carrito = {};
                pintarCarrito();
                Swal.fire(
                    'ELIMINADO!',
                    'Tu carrito esta vacio!!!',
                    'success'
                )
            } else {
                // Dijeron que no
            }
        });
    });
    
    // vaciar carrito 
    const btnFinalizar = document.getElementById('finalizar-compra')
    btnFinalizar.addEventListener('click', () => {
        Swal.fire({
            icon: 'success',
            title: "Tu compra se esta procesando...",
        })
        carrito = {};
        pintarCarrito();
    });
}

//botones carrito agregar o reducir
const btnAccion = e => {
    //accion de aumentar
    if (e.target.classList.contains('btn-info')) {
        Toastify({
            text: "Se agrego 1 articulo al carrito!!",
            duration: 3000,
            gravity: 'top',
            position: 'center',
            style: {
                background: "radial-gradient(circle, rgba(0,176,155,1) 26%, rgba(150,201,61,1) 100%)",
            }
        }).showToast();
        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id] = { ...producto }
        pintarCarrito()
    }

    //accion de disminuir
    if (e.target.classList.contains('btn-danger')) {
        Toastify({
            text: "Se elimino 1 articulo al carrito!!",
            duration: 3000,
            gravity: 'top',
            position: 'center',
            style: {
                background: "radial-gradient(circle, rgba(56,20,20,1) 26%, rgba(227,11,0,1) 100%)",
            }
        }).showToast();
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id]
        } else {
            carrito[e.target.dataset.id] = {...producto}
        }
        pintarCarrito()
    }
    e.stopPropagation()
}