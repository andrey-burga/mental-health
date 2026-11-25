import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "editor" | "user";
}

const STORAGE_KEYS = {
  users: "mock_bienestar_users",
  articles: "mock_bienestar_articles",
  testimonials: "mock_bienestar_testimonials",
  disorders: "mock_bienestar_disorders",
};

const INITIAL_USERS: StoredUser[] = [
  {
    id: "user-demo-1",
    name: "Invitado Bienestar",
    email: "demo@bienestar.com",
    password: "demo1234",
    role: "user",
  },
  {
    id: "user-editor-1",
    name: "Editora Psicoeducativa",
    email: "editor@bienestar.com",
    password: "editor1234",
    role: "editor",
  },
  {
    id: "user-admin-1",
    name: "Equipo Editorial",
    email: "admin@bienestar.com",
    password: "admin1234",
    role: "admin",
  },
];

const INITIAL_REFLECTIONS = [
  {
    id: "ref-1",
    phrase:
      "Cuidar tu mente no es egoísmo; es el punto de partida para habitar tu vida con mayor calma y claridad.",
    author: "Espacio Bienestar",
  },
  {
    id: "ref-2",
    phrase:
      "No tienes que resolverlo todo hoy. Respirar profundo y dar un paso pequeño también es avanzar.",
    author: "Comunidad de Autocuidado",
  },
  {
    id: "ref-3",
    phrase:
      "Pedir ayuda cuando el peso se vuelve demasiado grande es un acto profundo de valentía y respeto hacia ti.",
    author: "Red de Apoyo Emocional",
  },
];

const INITIAL_DISORDERS = [
  {
    id: "dis-1",
    slug: "trastorno-de-ansiedad-generalizada",
    title: "Trastorno de Ansiedad Generalizada",
    category: "ansiedad",
    description:
      "Preocupación persistente y difícil de controlar sobre situaciones cotidianas, acompañada de tensión física y mental continua.",
    symptoms: [
      { id: "s1", text: "Preocupación excesiva y constante difícil de detener" },
      { id: "s2", text: "Sensación de inquietud o estar constantemente al límite" },
      { id: "s3", text: "Tensión muscular frecuente en cuello, hombros o espalda" },
      { id: "s4", text: "Dificultad para concentrarse o sensación de mente en blanco" },
      { id: "s5", text: "Alteraciones del sueño o dificultad para conciliar el descanso" },
    ],
  },
  {
    id: "dis-2",
    slug: "trastorno-de-panico",
    title: "Trastorno de Pánico",
    category: "ansiedad",
    description:
      "Episodios súbitos e intensos de miedo o malestar físico agudo que alcanzan su punto máximo en pocos minutos.",
    symptoms: [
      { id: "s6", text: "Palpitaciones o ritmo cardíaco acelerado de forma repentina" },
      { id: "s7", text: "Sensación de falta de aire o dificultad para respirar" },
      { id: "s8", text: "Mareos, sudoración intensa o temblores involuntarios" },
      { id: "s9", text: "Miedo intenso a perder el control o a sufrir una crisis médica" },
    ],
  },
  {
    id: "dis-3",
    slug: "trastorno-depresivo-mayor",
    title: "Trastorno Depresivo Mayor",
    category: "animo",
    description:
      "Estado de ánimo persistentemente bajo y pérdida de interés o placer en las actividades habituales durante al menos dos semanas.",
    symptoms: [
      { id: "s10", text: "Tristeza profunda, vacío emocional o desesperanza prolongada" },
      { id: "s11", text: "Pérdida de interés en pasatiempos, vínculos o metas personales" },
      { id: "s12", text: "Fatiga constante o falta de energía incluso tras descansar" },
      { id: "s13", text: "Cambios significativos en el apetito o en los horarios de sueño" },
      { id: "s14", text: "Sentimientos de culpa excesiva o inutilidad" },
    ],
  },
  {
    id: "dis-4",
    slug: "trastorno-bipolar",
    title: "Trastorno Bipolar",
    category: "animo",
    description:
      "Alternancia entre episodios de estado de ánimo muy elevado o irritable (manía/hipomanía) y episodios de depresión.",
    symptoms: [
      { id: "s15", text: "Períodos de energía inusualmente alta y menor necesidad de dormir" },
      { id: "s16", text: "Pensamientos acelerados o dificultad para frenar el ritmo al hablar" },
      { id: "s17", text: "Fases posteriores de agotamiento emocional e intenso desánimo" },
      { id: "s18", text: "Cambios marcados en la toma de decisiones e impulsividad" },
    ],
  },
  {
    id: "dis-5",
    slug: "trastorno-obsesivo-compulsivo",
    title: "Trastorno Obsesivo-Compulsivo (TOC)",
    category: "conducta",
    description:
      "Presencia de pensamientos intrusivos recurrentes (obsesiones) que generan ansiedad y llevan a conductas repetitivas (compulsiones) para aliviarla.",
    symptoms: [
      { id: "s19", text: "Pensamientos o imágenes mentales persistentes y no deseados" },
      { id: "s20", text: "Necesidad urgente de realizar rituales de comprobación o limpieza" },
      { id: "s21", text: "Alivio solo temporal tras repetir ciertas conductas" },
      { id: "s22", text: "Interferencia significativa con el tiempo y la rutina diaria" },
    ],
  },
  {
    id: "dis-6",
    slug: "trastorno-por-estres-postraumatico",
    title: "Trastorno por Estrés Postraumático",
    category: "otros",
    description:
      "Respuesta emocional y física prolongada tras haber presenciado o experimentado una situación altamente traumática.",
    symptoms: [
      { id: "s23", text: "Recuerdos intrusivos o pesadillas relacionadas con el evento" },
      { id: "s24", text: "Evitación de lugares, conversaciones o estímulos asociados" },
      { id: "s25", text: "Estado constante de hipervigilancia o sobresalto fácil" },
      { id: "s26", text: "Dificultad para experimentar emociones positivas o sentirse seguro" },
    ],
  },
];

const INITIAL_ARTICLES = [
  {
    id: "art-1",
    slug: "como-establecer-limites-emocionales-saludables",
    title: "Cómo establecer límites emocionales saludables sin sentir culpa",
    category: "Autocuidado",
    description:
      "Guía práctica para identificar tus necesidades emocionales y comunicarlas con respeto en tu entorno familiar, laboral y social.",
    excerpt:
      "Aprender a decir no con amabilidad protege tu energía mental y fortalece relaciones más auténticas y equilibradas.",
    content:
      "Establecer límites no significa levantar muros para alejar a las personas, sino trazar con claridad hasta dónde llega tu bienestar físico y emocional.\n\nCuando asumimos responsabilidades que no nos corresponden por miedo al conflicto, acumulamos resentimiento y agotamiento.\n\nEmpieza identificando qué situaciones te drenan más energía. Practica frases breves, honestas y respetuosas como: 'Agradezco que confíes en mí, pero en este momento necesito priorizar mi descanso'. Con el tiempo, tus límites serán un reflejo natural de autocuidado.",
    published_at: "2026-10-12T10:00:00Z",
    author_id: "user-admin-1",
  },
  {
    id: "art-2",
    slug: "respiracion-consciente-y-sistema-nervioso",
    title: "La ciencia detrás de la respiración consciente y el sistema nervioso",
    category: "Regulación Emocional",
    description:
      "Descubre por qué ralentizar la exhalación envía una señal directa de seguridad a tu cerebro en momentos de estrés.",
    excerpt:
      "Respirar lento y profundo activa el sistema nervioso parasimpático, ayudando a disminuir el ritmo cardíaco y la sensación de alerta.",
    content:
      "Cuando percibimos una amenaza o sobrecarga mental, nuestro sistema simpático acelera la respiración y el pulso.\n\nAl aplicar técnicas como la respiración cuadrada (4-4-4-4) o la exhalación prolongada (4-7-8), estimulamos el nervio vago y activamos la respuesta de calma del organismo.\n\nDedicar tan solo tres minutos al día a observar tu respiración puede transformar la forma en que transitas los picos de ansiedad cotidiana.",
    published_at: "2026-10-20T14:30:00Z",
    author_id: "user-admin-1",
  },
  {
    id: "art-3",
    slug: "higiene-del-sueno-y-salud-mental",
    title: "Higiene del sueño: la base silenciosa de tu estabilidad emocional",
    category: "Hábitos",
    description:
      "Pequeños ajustes nocturnos que mejoran la calidad de tu descanso y reducen la vulnerabilidad al estrés.",
    excerpt:
      "Dormir bien no es un lujo; durante el sueño profundo el cerebro procesa emociones y consolida tu equilibrio diario.",
    content:
      "La relación entre el sueño y la salud mental es bidireccional: cuando descansamos mal somos más sensibles al estrés, y cuando estamos ansiosos nos cuesta conciliar el sueño.\n\nCrear una rutina de desconexión 45 minutos antes de dormir —atenuando luces, evitando pantallas y manteniendo horarios constantes— ayuda a regular tu reloj biológico.\n\nTu descanso es una inversión directa en tu claridad mental del día siguiente.",
    published_at: "2026-11-02T09:15:00Z",
    author_id: "user-admin-1",
  },
  {
    id: "art-4",
    slug: "romper-el-estigma-al-pedir-ayuda",
    title: "Romper el estigma: por qué pedir ayuda profesional es un acto de fortaleza",
    category: "Psicología",
    description:
      "Desmontamos los mitos más frecuentes sobre ir a terapia y explicamos cuándo conviene consultar con un especialista.",
    excerpt:
      "No hace falta llegar a una crisis extrema para hablar con un psicólogo; acompañar tu proceso a tiempo marca una gran diferencia.",
    content:
      "Durante años se nos enseñó que debíamos resolver nuestras cargas emocionales en silencio. Sin embargo, cuidar la mente requiere tanta atención como cuidar el cuerpo.\n\nAcudir a psicoterapia brinda un espacio confidencial, libre de juicios y con herramientas basadas en evidencia para comprender tus patrones emocionales.\n\nPedir ayuda no te hace frágil: te convierte en protagonista consciente de tu propio bienestar.",
    published_at: "2026-11-15T16:45:00Z",
    author_id: "user-admin-1",
  },
];

interface MockTestimonial {
  id: string;
  slug: string;
  title: string;
  category: string;
  status?: "pending" | "approved" | "rejected";
  excerpt: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    role: { id: string; name: string };
  };
}

const INITIAL_TESTIMONIALS: MockTestimonial[] = [
  {
    id: "test-pending-1",
    slug: "pedir-ayuda-a-tiempo-cambio-mi-semana",
    title: "Pedir ayuda a tiempo me dio un respiro cuando más lo necesitaba",
    category: "Acompañamiento",
    status: "pending",
    excerpt:
      "Comparto mi experiencia al animarme a hablar con un profesional tras meses de cargar todo en silencio.",
    content:
      "Durante varios meses pensé que debía resolver mi agotamiento por mi cuenta. Cuando finalmente reservé una primera consulta y empecé a registrar mis emociones sin exigirme perfección, sentí un alivio enorme.\n\nOjalá este mensaje anime a alguien más a dar ese primer paso con amabilidad.",
    created_at: "2026-11-22T14:15:00Z",
    author: {
      id: "user-demo-1",
      name: "Andrés L.",
      role: { id: "role-user", name: "Comunidad" },
    },
  },
  {
    id: "test-1",
    slug: "aprender-a-escuchar-mi-ansiedad",
    title: "Dejar de pelear con mi ansiedad me permitió empezar a sanar",
    category: "Ansiedad",
    status: "approved",
    excerpt:
      "Durante años pensé que sentir miedo significaba debilidad. En terapia aprendí que mis síntomas eran señales pidiendo pausa y cuidado.",
    content:
      "Durante mucho tiempo intenté ocultar lo que sentía para cumplir con las expectativas de todos menos las mías. Las mañanas comenzaban con opresión en el pecho y un cansancio que no se quitaba durmiendo.\n\nCuando finalmente me atreví a pedir ayuda psicológica, entendí que no estaba roto: simplemente llevaba demasiado tiempo sosteniendo cargas sin descanso. Empecé a usar un diario emocional y ejercicios diarios de respiración.\n\nHoy sigo teniendo días difíciles, pero ya no me asustan. Aprendí a tratarme con la misma compasión que ofrezco a quienes quiero.",
    created_at: "2026-10-18T11:20:00Z",
    author: {
      id: "user-seed-1",
      name: "Camila R.",
      role: { id: "1", name: "Comunidad" },
    },
  },
  {
    id: "test-2",
    slug: "volver-a-encontrar-calma-en-pequenos-pasos",
    title: "Volver a encontrar calma en los pequeños pasos diarios",
    category: "Depresión",
    excerpt:
      "Salir de un episodio depresivo no ocurrió de la noche a la mañana, pero celebrar cada pequeño logro devolvió color a mis días.",
    content:
      "Hubo meses en los que levantarme de la cama y preparar un desayuno parecía una montaña imposible. Sentía culpa por no rendir como antes.\n\nCon acompañamiento profesional y el apoyo paciente de mi familia, dejé de exigirme cambios gigantes y empecé por metas mínimas: abrir la ventana, caminar diez minutos y escribir una línea al final del día.\n\nSi hoy estás atravesando un momento oscuro, quiero recordarte que no tienes que poder con todo hoy; basta con dar un paso pequeño.",
    created_at: "2026-10-25T15:00:00Z",
    author: {
      id: "user-seed-2",
      name: "Mateo V.",
      role: { id: "1", name: "Paciente" },
    },
  },
  {
    id: "test-3",
    slug: "poner-limites-salvo-mi-equilibrio",
    title: "Poner límites en el trabajo salvó mi equilibrio emocional",
    category: "Estrés Laboral",
    excerpt:
      "Confundía disponibilidad constante con compromiso profesional, hasta que el agotamiento me obligó a redefinir mis prioridades.",
    content:
      "Respondía mensajes a medianoche y sentía ansiedad cada domingo por la tarde. Creía que parar era perder oportunidades.\n\nEl agotamiento físico y emocional me llevó a replantear mi rutina. Empecé a desconectar notificaciones fuera de horario y a reservar espacios reales para descansar.\n\nDescubrí que mi desempeño mejoró cuando mi mente tuvo espacio para recuperarse.",
    created_at: "2026-11-04T09:40:00Z",
    author: {
      id: "user-seed-3",
      name: "Lucía M.",
      role: { id: "1", name: "Comunidad" },
    },
  },
  {
    id: "test-4",
    slug: "hablar-en-voz-alta-rompio-el-silencio",
    title: "Hablar en voz alta rompió años de silencio",
    category: "Acompañamiento",
    excerpt:
      "Compartir lo que sentía con alguien de confianza me quitó el peso de fingir que todo estaba bien.",
    content:
      "Siempre fui la persona que escuchaba a los demás, pero me costaba muchísimo mostrar vulnerabilidad.\n\nEl día que le conté a un amigo cercano que llevaba semanas sintiéndome sobrepasado, descubrí que no estaba solo. Escuchar 'estoy aquí contigo' fue el inicio de mi recuperación.",
    created_at: "2026-11-10T18:10:00Z",
    author: {
      id: "user-seed-4",
      name: "Sebastián G.",
      role: { id: "1", name: "Comunidad" },
    },
  },
  {
    id: "test-5",
    slug: "respirar-antes-de-reaccionar",
    title: "Respirar antes de reaccionar cambió mis relaciones",
    category: "Mindfulness",
    excerpt:
      "Observar mis emociones sin juzgarlas de inmediato me ayudó a responder con mayor serenidad y empatía.",
    content:
      "Antes reaccionaba desde la frustración o el miedo cuando algo salía mal. Practicar pausas conscientes de respiración me dio unos segundos valiosos entre el estímulo y mi respuesta.\n\nEse pequeño espacio de calma transformó la manera en que me comunico conmigo y con mi familia.",
    created_at: "2026-11-16T12:00:00Z",
    author: {
      id: "user-seed-5",
      name: "Valeria T.",
      role: { id: "1", name: "Paciente" },
    },
  },
  {
    id: "test-6",
    slug: "construir-una-rutina-amable-de-autocuidado",
    title: "Construir una rutina amable de autocuidado",
    category: "Autocuidado",
    excerpt:
      "Dejé de ver el autocuidado como una lista rígida de tareas y lo convertí en pequeños gestos diarios de respeto hacia mí.",
    content:
      "Al principio me frustraba si no cumplía todos mis hábitos del día. Hoy entiendo que cuidarme también significa ser flexible cuando estoy cansada.\n\nBeber agua, estirarme unos minutos y escribir cómo me siento antes de dormir se volvieron anclas suaves para mi bienestar.",
    created_at: "2026-11-20T08:30:00Z",
    author: {
      id: "user-seed-6",
      name: "Sofía P.",
      role: { id: "1", name: "Comunidad" },
    },
  },
];

function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  } catch {
    return fallback;
  }
}

function writeStore<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignorar errores de cuota en storage
  }
}

function createMockJwt(payload: Record<string, unknown>): string {
  const encode = (obj: Record<string, unknown>) =>
    btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const header = encode({ alg: "HS256", typ: "JWT" });
  const body = encode({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 });
  return `${header}.${body}.mock-signature`;
}

function parseMockJwt(authHeader?: string): { sub?: string; id?: string; name?: string; email?: string; role?: string } | null {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function makeResponse<T>(
  config: InternalAxiosRequestConfig,
  status: number,
  data: T
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status >= 200 && status < 300 ? "OK" : "Error",
    headers: {},
    config,
  };
}

function makeError(config: InternalAxiosRequestConfig, status: number, detail: string) {
  const err: any = new Error(detail);
  err.config = config;
  err.isAxiosError = true;
  err.response = makeResponse(config, status, { detail });
  return Promise.reject(err);
}

function parseBody(data: any) {
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data;
}

function slugify(text: string): string {
  return (text || "item")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const mockApiAdapter: AxiosAdapter = async (config) => {
  const method = (config.method || "get").toLowerCase();
  const rawUrl = config.url || "/";
  const path = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  const body = parseBody(config.data);
  const authHeader = (config.headers?.Authorization || config.headers?.authorization) as string | undefined;
  const currentUser = parseMockJwt(authHeader);

  // Pequeña latencia natural para mostrar loaders brevemente sin bloquear
  await new Promise((resolve) => setTimeout(resolve, 120));

  // --- REFLECTIONS ---
  if (method === "get" && path === "/reflections/today") {
    const dayIndex = new Date().getDate() % INITIAL_REFLECTIONS.length;
    return makeResponse(config, 200, INITIAL_REFLECTIONS[dayIndex]);
  }

  // --- DISORDERS ---
  if (method === "get" && path === "/disorders") {
    const disorders = readStore(STORAGE_KEYS.disorders, INITIAL_DISORDERS);
    return makeResponse(config, 200, disorders);
  }

  if (method === "get" && path.startsWith("/disorders/slug/")) {
    const slugAliases: Record<string, string> = {
      ansiedad: "trastorno-de-ansiedad-generalizada",
      depresion: "trastorno-depresivo-mayor",
      estres: "trastorno-por-estres-postraumatico",
      panico: "trastorno-de-panico",
      toc: "trastorno-obsesivo-compulsivo",
      bipolar: "trastorno-bipolar",
    };
    const rawSlug = path.replace("/disorders/slug/", "");
    const resolvedSlug = slugAliases[rawSlug] || rawSlug;
    const disorders = readStore(STORAGE_KEYS.disorders, INITIAL_DISORDERS);
    const found = disorders.find((d) => d.slug === resolvedSlug);
    if (!found) return makeError(config, 404, "Trastorno no encontrado");
    return makeResponse(config, 200, found);
  }

  if (method === "post" && path === "/disorders/symptoms") {
    if (!currentUser || currentUser.role !== "admin") {
      return makeError(config, 403, "Se requieren permisos de administrador.");
    }
    const disorderId = String(body.disorder_id || "");
    const text = String(body.text || "").trim();
    if (!disorderId || !text) {
      return makeError(config, 400, "Indica el trastorno y el texto del síntoma.");
    }
    const disorders = readStore(STORAGE_KEYS.disorders, INITIAL_DISORDERS);
    const idx = disorders.findIndex((d) => d.id === disorderId);
    if (idx === -1) return makeError(config, 404, "Trastorno no encontrado");
    const newSymptom = { id: `sym-${Date.now()}`, text };
    disorders[idx] = {
      ...disorders[idx],
      symptoms: [...(disorders[idx].symptoms || []), newSymptom],
    };
    writeStore(STORAGE_KEYS.disorders, disorders);
    return makeResponse(config, 201, { ...newSymptom, disorder_id: disorderId });
  }

  if (method === "post" && path === "/disorders") {
    if (!currentUser || currentUser.role !== "admin") {
      return makeError(config, 403, "Se requieren permisos de administrador.");
    }
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    if (!title || !description) {
      return makeError(config, 400, "Título y descripción son obligatorios.");
    }
    const disorders = readStore(STORAGE_KEYS.disorders, INITIAL_DISORDERS);
    const newDisorder = {
      id: `dis-${Date.now()}`,
      slug: String(body.slug || "").trim() || slugify(title),
      title,
      category: String(body.category || "otros"),
      description,
      symptoms: [],
    };
    const updated = [newDisorder, ...disorders];
    writeStore(STORAGE_KEYS.disorders, updated);
    return makeResponse(config, 201, newDisorder);
  }

  if (method === "patch" && path.startsWith("/disorders/")) {
    if (!currentUser || currentUser.role !== "admin") {
      return makeError(config, 403, "Se requieren permisos de administrador.");
    }
    const id = path.replace("/disorders/", "");
    const disorders = readStore(STORAGE_KEYS.disorders, INITIAL_DISORDERS);
    const idx = disorders.findIndex((d) => d.id === id);
    if (idx === -1) return makeError(config, 404, "Trastorno no encontrado");
    disorders[idx] = { ...disorders[idx], ...body };
    writeStore(STORAGE_KEYS.disorders, disorders);
    return makeResponse(config, 200, disorders[idx]);
  }

  if (method === "delete" && path.startsWith("/disorders/")) {
    if (!currentUser || currentUser.role !== "admin") {
      return makeError(config, 403, "Se requieren permisos de administrador.");
    }
    const id = path.replace("/disorders/", "");
    const disorders = readStore(STORAGE_KEYS.disorders, INITIAL_DISORDERS);
    const filtered = disorders.filter((d) => d.id !== id);
    writeStore(STORAGE_KEYS.disorders, filtered);
    return makeResponse(config, 200, { deleted: true });
  }

  // --- AUTH ---
  if (method === "post" && path === "/auth/register") {
    const users = readStore<StoredUser[]>(STORAGE_KEYS.users, INITIAL_USERS);
    const email = String(body.email || "").trim().toLowerCase();
    if (!email || !body.password || !body.name) {
      return makeError(config, 400, "Por favor completa todos los campos.");
    }
    if (users.some((u) => u.email.toLowerCase() === email)) {
      return makeError(config, 400, "Ya existe una cuenta registrada con ese correo electrónico.");
    }
    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name: String(body.name).trim(),
      email,
      password: String(body.password),
      role: "user",
    };
    users.push(newUser);
    writeStore(STORAGE_KEYS.users, users);
    return makeResponse(config, 201, {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  }

  if (method === "post" && path === "/auth/login") {
    const users = readStore<StoredUser[]>(STORAGE_KEYS.users, INITIAL_USERS);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const found = users.find((u) => u.email.toLowerCase() === email && u.password === password);

    if (!found) {
      return makeError(config, 400, "Correo electrónico o contraseña incorrectos.");
    }

    const userPayload = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
    };
    const access_token = createMockJwt({
      sub: found.id,
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
    });

    return makeResponse(config, 200, {
      access_token,
      token_type: "bearer",
      user: userPayload,
    });
  }

  if (method === "get" && path === "/auth/me") {
    if (!currentUser) {
      return makeError(config, 401, "Sesión no autorizada o expirada.");
    }
    const users = readStore<StoredUser[]>(STORAGE_KEYS.users, INITIAL_USERS);
    const matched = users.find(
      (u) =>
        (currentUser.id && u.id === currentUser.id) ||
        (currentUser.sub && u.id === currentUser.sub) ||
        (currentUser.email && u.email.toLowerCase() === String(currentUser.email).toLowerCase())
    );
    const resolvedRole = (
      currentUser.role === "admin" || currentUser.role === "editor"
        ? currentUser.role
        : "user"
    ) as "admin" | "editor" | "user";
    const resolved = matched || {
      id: currentUser.id || currentUser.sub || "user-session",
      name: currentUser.name || "Usuario",
      email: currentUser.email || "",
      role: resolvedRole,
    };

    return makeResponse(config, 200, {
      id: resolved.id,
      name: resolved.name,
      email: resolved.email,
      role: resolved.role,
      role_id: `role-${resolved.role}`,
    });
  }

  // --- USERS MANAGEMENT (ADMIN) ---
  if (method === "get" && path === "/users") {
    if (!currentUser || currentUser.role !== "admin") {
      return makeError(config, 403, "Se requieren permisos de administrador.");
    }
    const users = readStore<StoredUser[]>(STORAGE_KEYS.users, INITIAL_USERS);
    const q = String(config.params?.q || "").trim().toLowerCase();
    const filtered = q
      ? users.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q)
        )
      : users;

    return makeResponse(
      config,
      200,
      filtered.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: { id: `role-${u.role}`, name: u.role },
        role_id: `role-${u.role}`,
      }))
    );
  }

  if (method === "patch" && path.startsWith("/users/") && path.endsWith("/role")) {
    if (!currentUser || currentUser.role !== "admin") {
      return makeError(config, 403, "Se requieren permisos de administrador.");
    }
    const userId = path.replace("/users/", "").replace(/\/role$/, "");
    const nextRole = String(body.role || "").toLowerCase();
    if (nextRole !== "user" && nextRole !== "editor" && nextRole !== "admin") {
      return makeError(config, 400, "Rol no válido.");
    }
    const users = readStore<StoredUser[]>(STORAGE_KEYS.users, INITIAL_USERS);
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return makeError(config, 404, "Usuario no encontrado.");
    users[idx] = { ...users[idx], role: nextRole };
    writeStore(STORAGE_KEYS.users, users);
    return makeResponse(config, 200, {
      id: users[idx].id,
      name: users[idx].name,
      email: users[idx].email,
      role: { id: `role-${nextRole}`, name: nextRole },
      role_id: `role-${nextRole}`,
    });
  }

  if (method === "post" && path === "/auth/forgot-password") {
    return makeResponse(config, 200, {
      message: "Si el correo está registrado, recibirás un enlace de recuperación.",
    });
  }

  if (method === "post" && path === "/auth/reset-password") {
    return makeResponse(config, 200, {
      message: "Contraseña restablecida correctamente.",
    });
  }

  // --- ARTICLES ---
  if (method === "get" && path === "/articles") {
    const articles = readStore(STORAGE_KEYS.articles, INITIAL_ARTICLES);
    return makeResponse(config, 200, articles);
  }

  if (method === "get" && path.startsWith("/articles/slug/")) {
    const slug = path.replace("/articles/slug/", "");
    const articles = readStore(STORAGE_KEYS.articles, INITIAL_ARTICLES);
    const found = articles.find((a) => a.slug === slug);
    if (!found) return makeError(config, 404, "Artículo no encontrado");
    return makeResponse(config, 200, found);
  }

  if (method === "post" && path === "/articles") {
    if (!currentUser) return makeError(config, 401, "No autorizado");
    const articles = readStore(STORAGE_KEYS.articles, INITIAL_ARTICLES);
    const newArticle = {
      id: `art-${Date.now()}`,
      slug: body.slug || slugify(body.title),
      title: body.title || "Sin título",
      description: body.description || "",
      excerpt: body.excerpt || "",
      content: body.content || "",
      category: body.category || "General",
      published_at: new Date().toISOString(),
      author_id: currentUser.id || currentUser.sub || null,
    };
    const updated = [newArticle, ...articles];
    writeStore(STORAGE_KEYS.articles, updated);
    return makeResponse(config, 201, newArticle);
  }

  if (method === "patch" && path.startsWith("/articles/")) {
    if (!currentUser) return makeError(config, 401, "No autorizado");
    const id = path.replace("/articles/", "");
    const articles = readStore(STORAGE_KEYS.articles, INITIAL_ARTICLES);
    const idx = articles.findIndex((a) => a.id === id);
    if (idx === -1) return makeError(config, 404, "Artículo no encontrado");
    articles[idx] = { ...articles[idx], ...body };
    writeStore(STORAGE_KEYS.articles, articles);
    return makeResponse(config, 200, articles[idx]);
  }

  if (method === "delete" && path.startsWith("/articles/")) {
    if (!currentUser) return makeError(config, 401, "No autorizado");
    const id = path.replace("/articles/", "");
    const articles = readStore(STORAGE_KEYS.articles, INITIAL_ARTICLES);
    const filtered = articles.filter((a) => a.id !== id);
    writeStore(STORAGE_KEYS.articles, filtered);
    return makeResponse(config, 200, { deleted: true });
  }

  // --- TESTIMONIALS ---
  if (method === "get" && path === "/testimonials") {
    const testimonials = readStore(STORAGE_KEYS.testimonials, INITIAL_TESTIMONIALS);
    const statusParam = String(config.params?.status || "").toLowerCase();
    const filtered =
      statusParam === "all"
        ? testimonials
        : statusParam
        ? testimonials.filter((t: any) => (t.status || "approved") === statusParam)
        : testimonials.filter((t: any) => (t.status || "approved") === "approved");

    const skip = Number(config.params?.skip ?? 0);
    const limit = Number(config.params?.limit ?? filtered.length);
    return makeResponse(config, 200, filtered.slice(skip, skip + limit));
  }

  if (method === "get" && path.startsWith("/testimonials/")) {
    const slugOrId = path.replace("/testimonials/", "");
    const testimonials = readStore(STORAGE_KEYS.testimonials, INITIAL_TESTIMONIALS);
    const found = testimonials.find((t) => t.id === slugOrId || t.slug === slugOrId);
    if (!found) return makeError(config, 404, "Testimonio no encontrado");
    return makeResponse(config, 200, found);
  }

  if (method === "post" && path === "/testimonials") {
    if (!currentUser) return makeError(config, 401, "No autorizado");
    const testimonials = readStore(STORAGE_KEYS.testimonials, INITIAL_TESTIMONIALS);
    const isStaff = currentUser.role === "admin" || currentUser.role === "editor";
    const newItem = {
      id: `test-${Date.now()}`,
      slug: body.slug || slugify(body.title),
      title: body.title || "Sin título",
      excerpt: body.excerpt || "",
      content: body.content || "",
      category: "Testimonio",
      status: isStaff ? "approved" : "pending",
      created_at: new Date().toISOString(),
      author: {
        id: currentUser.id || currentUser.sub || "user-anon",
        name: currentUser.name || "Usuario",
        role: { id: `role-${currentUser.role || "user"}`, name: isStaff ? "Equipo Editorial" : "Comunidad" },
      },
    };
    const updated = [newItem, ...testimonials];
    writeStore(STORAGE_KEYS.testimonials, updated);
    return makeResponse(config, 201, newItem);
  }

  if (method === "patch" && path.startsWith("/testimonials/") && path.endsWith("/status")) {
    if (!currentUser || currentUser.role !== "admin") {
      return makeError(config, 403, "Se requieren permisos de administrador.");
    }
    const id = path.replace("/testimonials/", "").replace(/\/status$/, "");
    const nextStatus = String(body.status || "");
    if (nextStatus !== "approved" && nextStatus !== "rejected") {
      return makeError(config, 400, "Estado inválido.");
    }
    const testimonials = readStore<MockTestimonial[]>(
      STORAGE_KEYS.testimonials,
      INITIAL_TESTIMONIALS
    );
    const idx = testimonials.findIndex((t) => t.id === id);
    if (idx === -1) return makeError(config, 404, "Testimonio no encontrado");
    testimonials[idx] = { ...testimonials[idx], status: nextStatus };
    writeStore(STORAGE_KEYS.testimonials, testimonials);
    return makeResponse(config, 200, testimonials[idx]);
  }

  if (method === "put" && path.startsWith("/testimonials/")) {
    if (!currentUser) return makeError(config, 401, "No autorizado");
    const id = path.replace("/testimonials/", "");
    const testimonials = readStore(STORAGE_KEYS.testimonials, INITIAL_TESTIMONIALS);
    const idx = testimonials.findIndex((t) => t.id === id);
    if (idx === -1) return makeError(config, 404, "Testimonio no encontrado");
    testimonials[idx] = { ...testimonials[idx], ...body };
    writeStore(STORAGE_KEYS.testimonials, testimonials);
    return makeResponse(config, 200, testimonials[idx]);
  }

  if (method === "delete" && path.startsWith("/testimonials/")) {
    if (!currentUser) return makeError(config, 401, "No autorizado");
    const id = path.replace("/testimonials/", "");
    const testimonials = readStore(STORAGE_KEYS.testimonials, INITIAL_TESTIMONIALS);
    const filtered = testimonials.filter((t) => t.id !== id);
    writeStore(STORAGE_KEYS.testimonials, filtered);
    return makeResponse(config, 200, { deleted: true });
  }

  return makeError(config, 404, `Ruta no encontrada en modo local: ${path}`);
};
