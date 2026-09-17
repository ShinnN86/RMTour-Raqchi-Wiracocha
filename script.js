
    const camara = document.querySelector("[camera]");
    const templo = document.querySelector("#templo");

    const infoBox = document.querySelector("#infoBox");
    const titulo = document.querySelector("#titulo");
    const descripcion = document.querySelector("#descripcion");

    const listaObjetos = document.getElementById("listaObjetos");

    const canvas = document.getElementById("lineCanvas");
    const ctx = canvas.getContext("2d");


    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let lastHit = null;
    let meshList = [];

    const mover = {
      w: false,
      a: false,
      s: false,
      d: false,
      up: false,
      down: false
    };

    const infoPartes = {

      "Plano_1": {
        titulo: "Muro",
        descripcion: "Muro interno del templo wiracocha"
      },

      "Plano001": {
        titulo: "Muro",
        descripcion: ""
      },

      "Plano0003": {
        titulo: "Columna",
        descripcion: "Soporte estructural de piedra."
      },

      "Columna4": {
        titulo: "Columna",
        descripcion: "Columna interna"
      }

    };
    window.addEventListener("keydown", (e) => {
      const pos = camara.getAttribute("position");
      const paso = 0.25;

      switch (e.key.toLowerCase()) {
        case "q":

          pos.y += paso;

          camara.setAttribute("position", pos);
          break;
        case "e":
          pos.y -= paso;
          camara.setAttribute("position", pos);

          break;

      }

    });

    [
      ["btnW", "w"],
      ["btnA", "a"],
      ["btnS", "s"],
      ["btnD", "d"],
      ["btnUp", "up"],
      ["btnDown", "down"]

    ].forEach(([id, key]) => {

      const boton = document.getElementById(id);

      if (!boton) return;
      boton.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        mover[key] = true;
      });
      boton.addEventListener("pointerup", (e) => {

        e.preventDefault();

        mover[key] = false;

      });
      boton.addEventListener("pointerleave", () => {

        mover[key] = false;
      });
      boton.addEventListener("pointercancel", () => {

        mover[key] = false;
      });
    });
    templo.addEventListener("model-loaded", () => {

      const mesh = templo.getObject3D("mesh");

      meshList = [];
      /*
        Limpiar lista anterior
      */
      if (listaObjetos) {

        listaObjetos.innerHTML = "";

      }
      /*
        Recorrer todos los objetos del GLB
      */
      mesh.traverse((obj) => {

        if (!obj.isMesh) return;


        /*
          Marcar como interactuable
        */
        obj.userData.clickable = true;


        /*
          Guardar en la lista para el Raycaster
        */

        meshList.push(obj);


        /*
          Mostrar objeto en la lista de pantalla
        */

        if (listaObjetos) {

          const li = document.createElement("li");

          li.textContent = obj.name || "Objeto sin nombre";

          listaObjetos.appendChild(li);

        }

      });

      console.log("OBJETOS INTERACTUABLES");

      meshList.forEach((obj) => {

        console.log("•", obj.name);

      });
      console.log("Total de objetos:", meshList.length);

    });

    window.addEventListener("mousemove", (event) => {

      if (meshList.length === 0) return;
      const camera = camara.getObject3D("camera");

      mouse.x =
        (event.clientX / window.innerWidth) * 2 - 1;

      mouse.y =
        -(event.clientY / window.innerHeight) * 2 + 1;


      raycaster.setFromCamera(mouse, camera);

      const intersects =
        raycaster.intersectObjects(meshList, true);


      if (intersects.length === 0) {

        ocultarInfo();

        return;

      }

      const hit = intersects[0];
      const obj = hit.object;
      const data = infoPartes[obj.name];

      if (!data) {

        ocultarInfo();

        return;

      }

      lastHit = obj.name;

      mostrarInfo(data);
      drawConnection(hit.point);

    });

    function detectarCentro() {

      if (
        !("ontouchstart" in window) &&
        navigator.maxTouchPoints <= 0
      ) {

        return;

      }

      const camera = camara.getObject3D("camera");

      raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
      );

      const intersects =
        raycaster.intersectObjects(meshList, true);


      if (intersects.length === 0) {

        ocultarInfo();

        return;

      }


      const hit = intersects[0];
      const obj = hit.object;
      const data = infoPartes[obj.name];

      if (!data) {

        ocultarInfo();

        return;

      }



      lastHit = obj.name;



      mostrarInfo(data);

      drawConnection(hit.point);

    }

    window.addEventListener("click", () => {

      if (!lastHit) return;
      const data = infoPartes[lastHit];
      if (!data) return;
      mostrarInfo(data);

    });

    function mostrarInfo(data) {

      titulo.textContent = data.titulo;

      descripcion.textContent = data.descripcion;

      infoBox.style.display = "block";

    }


    function ocultarInfo() {

      lastHit = null;

      infoBox.style.display = "none";

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

    }


    function resizeCanvas() {

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

    }

    resizeCanvas();

    window.addEventListener(
      "resize",
      resizeCanvas
    );

    function drawConnection(worldPoint) {

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
      const camera =
        camara.getObject3D("camera");
      const pos = worldPoint.clone();

      pos.project(camera);

      const x =
        (pos.x * 0.5 + 0.5) *
        canvas.width;


      const y =
        (-pos.y * 0.5 + 0.5) *
        canvas.height;


      const box =
        infoBox.getBoundingClientRect();
      const x2 = box.left;

      const y2 =
        box.top +
        box.height / 2;


      /* 
         Linea*/

      ctx.strokeStyle = "#ffd56a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.fillStyle = "#ffd56a";


      ctx.beginPath();

      ctx.arc(
        x,
        y,
        7,
        0,
        Math.PI * 2
      );

      ctx.fill();

    }


    /* 
       ANIMACIÓN */

    function animate() {

      requestAnimationFrame(animate);


      const velocidad = 0.12;

      const velocidadY = 0.08;


      /* 
         MOVIMIENTO */

      if (mover.w) {

        camara.object3D.translateZ(
          -velocidad
        );

      }
      if (mover.s) {

        camara.object3D.translateZ(
          velocidad
        );
      }
      if (mover.a) {

        camara.object3D.translateX(
          -velocidad
        );
      }
      if (mover.d) {

        camara.object3D.translateX(
          velocidad
        );
      }
      if (mover.up) {

        camara.object3D.position.y +=
          velocidadY;

      }
      if (mover.down) {

        camara.object3D.position.y -=
          velocidadY;

      }

      detectarCentro();
    }
    animate();


