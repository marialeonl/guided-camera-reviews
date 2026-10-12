/* English copy layer for the review prototype (portfolio version).
   Replaces visible text, placeholders and aria-labels, including text the
   prototype injects later (voice dictation, toasts, camera feedback, sheets). */
(function () {
  // Whole-text matches (safe for short labels)
  var EXACT = {
    // Preview
    'Recortar': 'Trim', 'Texto': 'Text', 'Silenciar': 'Mute', 'Activar sonido': 'Unmute', 'Subtítulos': 'Subtitles',
    'Agregar más': 'Add more', 'Subir': 'Save', 'Descartar': 'Discard', 'Cancelar': 'Cancel', 'Buscar': 'Search',
    'Guardar': 'Save', 'Eliminar': 'Delete', 'Reproducir': 'Play', 'Pausar': 'Pause', 'espacio': 'space', 'Borrar': 'Delete',
    'Mayúsculas': 'Shift', 'Mostrar subtítulos': 'Show subtitles', 'Editar subtítulos': 'Edit subtitles',
    'Sugeridos para ti': 'Suggested for you', 'Agregar texto': 'Add text', 'Más stickers': 'More stickers',
    'Reiniciar prototipo': 'Restart prototype',
    // Form
    'Chico': 'Small', 'Pequeño': 'Small', 'Grande': 'Large', 'Un poco chico': 'A bit small', 'Un poco grande': 'A bit large',
    'Como esperaba': 'As expected', 'Nuevo': 'New', 'Cerrar': 'Close', 'Volver': 'Back',
    // Camera controls + tabs
    'Girar cámara': 'Flip', 'Voltear cámara': 'Flip camera', 'Flash': 'Flash', 'Temporizador': 'Timer',
    'Siguiente': 'Next', 'Mostrar': 'Show', 'Acercar': 'Close-up', 'Usar': 'Use',
    'puntos': 'tickets', 'Video guiado': 'Guided video', 'Video': 'Video', 'Foto': 'Photo', 'Fotos': 'Photos',
    'Videos': 'Videos', 'Galería': 'Gallery', 'Colecciones': 'Albums', 'Configuración': 'Settings',
    'Recientes': 'Recent', 'Productos': 'Products', 'Hogar': 'Home', 'Continuar': 'Continue',
    'Vista previa': 'Preview', 'Listo': 'Done', 'Seguir grabando': 'Keep recording', 'Descartar video': 'Discard video',
    // Sidebar ("try the states")
    'Feedback de calidad': 'Quality feedback', 'Cámara · Automática': 'Camera · Automatic', 'Cámara · Manual': 'Camera · Manual',
    'Casos': 'States', 'Cámara normal': 'Normal', 'Muy oscuro': 'Too dark', 'Cámara estática': 'Static camera',
    'Producto no visible': 'Product not visible', 'Detección de desenfoque / Autoenfoque': 'Blur detection · Autofocus',
    'Modo Retrato': 'Portrait mode', 'Mensajes de calidad': 'Quality messages'
  };
  // Substring matches (longer phrases)
  var PHRASES = [
    // Preview (specific phrases first so they win over the generic ones below)
    ['Detuvimos la grabación. El video debe durar máximo 90 segundos.', 'We stopped the recording. Videos can be up to 90 seconds.'],
    ['No hay nada grabado todavía.', 'Nothing recorded yet.'],
    ['Arrastra para eliminar', 'Drag to delete'],
    ['¿Quieres descartar este video?', 'Discard this video?'],
    ['Si lo descartas volverás a la cámara para grabar o subir un video nuevo.', 'If you discard it, you’ll go back to the camera to record or upload a new one.'],
    ['Selecciona un texto para modificar', 'Select a line to edit'],
    ['No encontramos stickers para tu búsqueda.', 'No stickers found for your search.'],
    ['⭐ 5 estrellas', '⭐ 5 stars'], ['⭐ 4 estrellas', '⭐ 4 stars'], ['💰 Vale la pena', '💰 Worth it'],
    ['🔊 Muy buen sonido', '🔊 Great sound'], ['📶 Se conecta fácil', '📶 Connects easily'],
    ['🔋 La batería dura mucho', '🔋 Great battery life'], ['😍 Me gustó mucho', '😍 Loved it'],
    ['🤩 Me sorprendió', '🤩 Pleasantly surprised'], ['🤩 ¡Me encantó!', '🤩 Absolutely loved it!'],
    ['✨ Se nota la calidad', '✨ You can tell it’s quality'], ['✅ Viene completo', '✅ Comes complete'],
    ['✨ Muy buen diseño', '✨ Great design'], ['👍 Lo recomiendo', '👍 I recommend it'],
    ['✨ Llegó impecable', '✨ Arrived in perfect condition'],
    // aria-labels
    ['Fondo del texto: sin fondo', 'Text background: none'], ['Fondo del texto: fondo blanco', 'Text background: white'], ['Fondo del texto: fondo negro', 'Text background: black'], ['Fondo del texto:', 'Text background:'],
    ['Recortar video', 'Trim video'], ['Contenido seleccionado', 'Selected content'], ['Contenido grabado', 'Recorded content'],
    ['Cerrar subtítulos', 'Close subtitles'], ['Activar o desactivar subtítulos', 'Turn subtitles on or off'],
    ['Teclado para editar subtítulos', 'Keyboard for editing subtitles'], ['Subtítulos de la opinión', 'Review subtitles'],
    ['Previsualización del video', 'Video preview'], ['Reproducir video', 'Play video'], ['Línea de tiempo del video', 'Video timeline'],
    ['Posición de reproducción', 'Playback position'], ['Alineación de texto', 'Text alignment'], ['Cambiar fondo del texto', 'Change text background'],
    ['Cerrar recorte', 'Close trim'], ['Selecciona el tramo del video para recortar', 'Select the part of the video to keep'],
    ['Inicio del recorte', 'Trim start'], ['Fin del recorte', 'Trim end'], ['Variante de preview', 'Preview variant'],
    // Camera control labels for screen readers (must run before the generic "segundos")
    ['Temporizador: apagado', 'Timer: off'], ['Temporizador: ', 'Timer: '],
    ['Flash apagado', 'Flash: off'], ['Flash encendido', 'Flash: on'],
    ['Opina, gana 250 puntos y canjéalos por', 'Review it, earn 250 tickets and redeem them for'],
    ['cupones de hasta $ 10.000', 'coupons'],
    ['Apple AirPods Max - Audífonos inalámbricos de diadema', 'Apple AirPods Max · Wireless over-ear headphones'],
    ['¿Qué te pareció el producto?', 'How was it?'],
    ['Muéstranos tu producto', 'Show your product'],
    ['Video / Foto / Video guiado', 'Video · Photo · Guided video'],
    ['Video guiado / Video / Foto', 'Guided video · Video · Photo'],
    ['puntos video guiado', 'tickets guided video'],
    ['Revisaremos que el contenido muestre el producto y tenga buena calidad.', 'We check that it shows the product clearly.'],
    ['Cuéntanos sobre el producto', 'Tell us more'],
    ['¿Qué le dirías a otras personas sobre este producto?', 'What would you tell other buyers?'],
    ['Opina anónimamente', 'Post anonymously'],
    ['¿Cómo te quedó?', 'How did it fit?'],
    ['Para que tu opinión se publique y te dé recompensas, debe cumplir con las', 'To be published and earn rewards, your review must follow our'],
    ['Políticas sobre opiniones de productos.', 'review policy.'],
    ['Políticas sobre opiniones', 'review policy'],
    ['Publicar opinión', 'Post review'],
    ['¡Gracias por tu opinión!', 'Thanks for your review!'],
    ['Suelta para enviar', 'Release to send'],
    ['Transcribiendo audio...', 'Transcribing…'],
    ['No te entendí, prueba de nuevo', 'Didn’t catch that, try again'],
    ['El dictado por voz no está disponible en este navegador.', 'Voice dictation isn’t available in this browser.'],
    ['No pudimos usar el micrófono. Intentá de nuevo.', 'We couldn’t use the microphone. Try again.'],
    ['Para usar el dictado por voz, permití el acceso al micrófono.', 'To dictate, allow microphone access.'],
    ['Solicitando acceso al micrófono', 'Requesting microphone access'],
    ['Finalizar grabación y transcribir', 'Stop and transcribe'],
    ['Grabar opinión por voz', 'Review by voice'],
    ['Cancelar grabación', 'Cancel recording'],
    ['Cómo ganar puntos con tu opinión', 'How to earn tickets'],
    ['Graba un video guiado', 'Record a guided video'],
    ['Muestra el producto en fragmentos de 4 segundos siguiendo nuestras indicaciones.', 'Short 4-second takes, following our prompts.'],
    ['Sube al menos un video', 'Add a video'],
    ['Muestra el producto de forma clara durante al menos 5 segundos.', 'Show the product clearly for at least 5 seconds.'],
    ['Sube al menos una foto', 'Add a photo'],
    ['Muestra el producto de forma clara, de cerca y bien iluminado.', 'Close up and well lit.'],
    ['Comenta qué te pareció el producto', 'Write a comment'],
    ['Puedes hablar de su calidad, desempeño o si cumplió tus expectativas.', 'Quality, performance, or whether it met your expectations.'],
    ['Solo recibirán tickets las opiniones con fotos, videos y/o comentarios sobre el producto.', 'Tickets are only given to reviews with photos, videos or comments about the product.'],
    ['Si tu opinión tiene contenido irrelevante o inapropiado, puedes perder los tickets ganados.', 'Irrelevant or inappropriate content may lose the tickets earned.'],
    ['Podrás canjear tus tickets por cupones y usarlos en productos seleccionados.', 'Redeem your tickets for coupons on selected products.'],
    ['Una vez publicada tu opinión, no podrás editarla para ganar tickets.', 'Once posted, a review can’t be edited to earn more tickets.'],
    ['Tu opinión debe cumplir con nuestras', 'Your review must follow our'],
    ['Ver más sobre las recompensas', 'How rewards work'],
    ['Vista previa del video', 'Video preview'], ['Foto tomada con la cámara', 'Photo taken with the camera'],
    ['Frame del video grabado', 'Recorded video frame'],
    // Camera
    ['Activá el permiso de cámara en tu navegador para continuar.', 'Allow camera access in your browser to continue.'],
    ['Este navegador no soporta acceso a la cámara.', 'This browser doesn’t support camera access.'],
    ['La cámara está siendo usada por otra aplicación.', 'The camera is being used by another app.'],
    ['No pudimos acceder a la cámara.', 'We couldn’t access the camera.'],
    ['No se encontró ninguna cámara disponible.', 'No camera found.'],
    ['El video debe durar', 'Each take lasts'],
    ['segundos.', 'seconds.'], ['segundos', 'seconds'],
    ['Muestra el producto de frente', '1. Show the product from the front'],
    ['Acércate para mostrar sus detalles', '2. Get closer to show the details'],
    ['Muestra cómo se usa', '3. Show how it’s used'],
    ['Completa los tres fragmentos para mostrar el producto, sus detalles y cómo se usa.', 'Record three short takes: the product, its details and how it’s used.'],
    ['Busca un lugar con más luz', 'Find a spot with more light'],
    ['Dale más movimiento al video', 'Move the camera a little'],
    ['El producto no está visible', 'The product isn’t visible'],
    ['Estamos creando la previsualización de tu video', 'Creating your video preview'],
    ['¿Te vas sin ganar 90 puntos?', 'Leave without your 90 tickets?'],
    ['Termina tu video y súbelo para conseguirlos.', 'Finish your video and post it to get them.'],
    ['Puedes seleccionar hasta 8 fotos y 3 videos', 'Select up to 8 photos and 3 videos'],
    ['Ya subiste el máximo de 3 videos', 'You’ve added the maximum of 3 videos'],
    ['Ya subiste el máximo de 8 fotos', 'You’ve added the maximum of 8 photos'],
    ['Agregar desde galería', 'Add from gallery'], ['Borrar grabación', 'Delete recording'],
    ['Cerrar guía', 'Close guide'], ['Cerrar previsualización', 'Close preview'],
    ['Instrucciones del video guiado', 'Guided video instructions'], ['Guardar video', 'Save'],
    ['Enviar para procesar', 'Save'], ['Volver a la galería', 'Back to gallery'], ['Quitar selección', 'Deselect'],
    ['¿Necesitas ayuda?', 'Need help?'], ['Más opciones', 'More options'],
    ['Detecta problemas que pueden reducir la utilidad de la review y da feedback durante la captura.', 'Detects common issues while recording and gives a quick tip.'],
    ['Detecta si el producto está desenfocado e intenta corregir el foco. Si no lo logra, puede pedir al usuario hacer tap sobre el producto para enfocar.', 'Detects blur and refocuses. If it can’t, it asks the buyer to tap the product.'],
    ['Desenfoca el fondo para dar mayor protagonismo al producto o a la persona durante la captura.', 'Blurs the background so the product stands out.'],
    ['elementos', 'items'],
    ['Recientes', 'Recents'],
    ['5 estrellas', '5 stars'], ['4 estrellas', '4 stars'], ['3 estrellas', '3 stars'], ['2 estrellas', '2 stars'], ['1 estrella', '1 star']
  ];
  var RULES = [
    [/PASO (\d) DE (\d)/g, 'STEP $1 OF $2'],
    [/Subir \((\d+)\)/g, 'Save ($1)'],
    [/(\d+)\s*puntos/g, '+$1 tickets']
  ];

  function tr(text) {
    if (!text || !/[A-Za-zÁÉÍÓÚáéíóúñ¿¡]/.test(text)) return text;
    var trimmed = text.trim();
    if (EXACT.hasOwnProperty(trimmed)) return text.replace(trimmed, EXACT[trimmed]);
    var out = text;
    for (var i = 0; i < PHRASES.length; i++) {
      if (out.indexOf(PHRASES[i][0]) !== -1) out = out.split(PHRASES[i][0]).join(PHRASES[i][1]);
    }
    for (var j = 0; j < RULES.length; j++) out = out.replace(RULES[j][0], RULES[j][1]);
    return out;
  }
  function fixNode(n) { var t = tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; }
  function walk(root) {
    if (root.nodeType === 3) return fixNode(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      if (n.parentElement && /^(SCRIPT|STYLE)$/.test(n.parentElement.tagName)) continue;
      fixNode(n);
    }
    var els = root.querySelectorAll ? root.querySelectorAll('[placeholder],[aria-label],[title],[alt],[data-placeholder]') : [];
    for (var i = 0; i < els.length; i++) {
      ['placeholder', 'aria-label', 'title', 'alt', 'data-placeholder'].forEach(function (a) {
        var v = els[i].getAttribute(a);
        if (v) { var t = tr(v); if (t !== v) els[i].setAttribute(a, t); }
      });
    }
  }
  function run() {
    document.documentElement.lang = 'en';
    var page = location.pathname.split('/').pop();
    document.title = page.indexOf('review-form') === 0 ? 'Review form · Prototype'
      : page.indexOf('camara-preview') === 0 ? 'Review preview · Prototype' : 'Review camera · Prototype';
    walk(document.body);
    var ATTRS = ['placeholder', 'aria-label', 'title', 'alt', 'data-placeholder'];
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.type === 'characterData') fixNode(m.target);
        else if (m.type === 'attributes') {
          var v = m.target.getAttribute(m.attributeName);
          if (v) { var t = tr(v); if (t !== v) m.target.setAttribute(m.attributeName, t); }
        }
        else m.addedNodes.forEach(walk);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
