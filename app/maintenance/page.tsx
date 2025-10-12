export default function MaintenancePage() {
    return (
        <main style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            flexDirection: "column",
            textAlign: "center",
            padding: "1rem",
        }}>
            <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                We&apos;ll be back soon!
            </h1>
            <p style={{ fontSize: "1.25rem", marginBottom: "2rem" }}>
                Our website is currently under maintenance. Please check back later.
            </p>
        </main>
    );
}