function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#2C3E50",
        color: "#fff",
        padding: "1.5rem",
        textAlign: "center",
        marginTop: "2rem",
      }}
    >
      {" "}
      <p>
        © {new Date().getFullYear()} Salud Mental. Todos los derechos
        reservados.
      </p>{" "}
      <p>
        {" "}
        <a
          href="/contacto"
          style={{ color: "#4A90E2", textDecoration: "none" }}
        >
          {" "}
          Contáctanos{" "}
        </a>{" "}
        |{" "}
        <a
          href="/privacidad"
          style={{
            color: "#4A90E2",
            textDecoration: "none",
            marginLeft: "0.5rem",
          }}
        >
          {" "}
          Política de Privacidad{" "}
        </a>{" "}
      </p>{" "}
    </footer>
  );
}

export default Footer