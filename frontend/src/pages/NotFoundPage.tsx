import { Link } from "react-router-dom";
import { MapIcon } from "../components/common/Icons";

export default function NotFoundPage() {
  return (
    <section className="notfound">
      <p className="notfound__code">404</p>
      <h1>Stranica ne postoji</h1>
      <p className="text-muted" style={{ maxWidth: "44ch" }}>
        Link je možda pogrešan ili je stranica premeštena. Vrati se na svoje planove putovanja.
      </p>
      <Link to="/" className="btn btn-primary">
        <MapIcon />
        Nazad na planove
      </Link>
    </section>
  );
}
