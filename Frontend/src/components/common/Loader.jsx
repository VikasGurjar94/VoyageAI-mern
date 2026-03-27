const Loader = ({ message = "Loading..." }) => (
  <div style={styles.wrapper}>
    <div style={styles.spinner} />
    <p style={styles.text}>{message}</p>
  </div>
);

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
  },
  spinner: {
    width: "44px",
    height: "44px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #e94560",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  text: {
    marginTop: "16px",
    color: "#6b7280",
    fontSize: "15px",
  },
};

export default Loader;
