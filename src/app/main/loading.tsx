/**
 * Loading UI shown during route transitions within the /main section.
 * Renders inside the main layout — sidebar + header stay visible.
 */
export default function MainLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 76.76px)",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div className="page-loader-track" style={{ width: "80px" }}>
        <div className="page-loader-fill" />
      </div>
    </div>
  );
}
