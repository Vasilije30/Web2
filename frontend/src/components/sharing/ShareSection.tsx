import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import type { ShareAccessType, ShareLink } from "../../models/ShareLink";
import * as sharingService from "../../services/sharingService";
import { extractErrorMessage } from "../../utils/apiError";
import { formatDateTime } from "../../utils/format";
import { useConfirm } from "../common/ConfirmProvider";
import { Alert, EmptyState, Loading } from "../common/Feedback";
import { CopyIcon, EyeIcon, LinkIcon, PencilIcon, QrIcon, ShareIcon, TrashIcon } from "../common/Icons";
import Panel from "../common/Panel";

const accessTypeLabels: Record<ShareAccessType, string> = {
  View: "Samo pregled",
  Edit: "Pregled i izmena",
};

function shareUrl(token: string): string {
  return `${window.location.origin}/shared/${token}`;
}

export default function ShareSection({ tripId }: { tripId: string }) {
  const confirm = useConfirm();
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [accessType, setAccessType] = useState<ShareAccessType>("View");
  const [expiresInHours, setExpiresInHours] = useState(72);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    loadLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function loadLinks() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await sharingService.getShareLinks(tripId);
      setLinks(data);
    } catch (error) {
      setLoadError(extractErrorMessage(error, "Linkovi za deljenje nisu učitani."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    setIsCreating(true);
    setCreateError(null);
    try {
      await sharingService.createShareLink(tripId, accessType, expiresInHours);
      await loadLinks();
    } catch (error) {
      setCreateError(extractErrorMessage(error, "Kreiranje linka nije uspelo."));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRevoke(token: string) {
    const confirmed = await confirm({
      title: "Opozvati link za deljenje?",
      message: "Osoba kojoj si ga poslao/la više neće moći da pristupi planu preko tog linka ili QR koda.",
      confirmLabel: "Opozovi link",
    });
    if (!confirmed) return;
    await sharingService.revokeShareLink(tripId, token);
    await loadLinks();
  }

  async function handleCopy(token: string) {
    await navigator.clipboard.writeText(shareUrl(token));
    setCopiedToken(token);
    setTimeout(() => setCopiedToken((current) => (current === token ? null : current)), 2000);
  }

  const activeLinks = links.filter((link) => !link.revoked && new Date(link.expiresAt) > new Date());

  return (
    <Panel
      icon={<ShareIcon />}
      title="Deljenje plana"
      subtitle="Podeli plan linkom ili QR kodom — primalac ne mora da ima nalog"
    >
      <div className="card card-pad">
        <div className="form-inline">
          <div className="form-field">
            <label className="form-label" htmlFor="share-access-type">
              Tip pristupa
            </label>
            <select
              id="share-access-type"
              className="form-select"
              value={accessType}
              onChange={(e) => setAccessType(e.target.value as ShareAccessType)}
            >
              <option value="View">Samo pregled</option>
              <option value="Edit">Pregled i izmena</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="share-expires">
              Važi (sati)
            </label>
            <input
              id="share-expires"
              className="form-input"
              type="number"
              min={1}
              max={720}
              value={expiresInHours}
              onChange={(e) => setExpiresInHours(Number(e.target.value))}
            />
          </div>

          <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={isCreating}>
            {isCreating ? <span className="spinner spinner-sm" /> : <LinkIcon />}
            {isCreating ? "Kreiranje..." : "Kreiraj link"}
          </button>
        </div>
      </div>

      {createError && <Alert>{createError}</Alert>}

      {isLoading && <Loading />}
      {loadError && <Alert>{loadError}</Alert>}

      {!isLoading && !loadError && activeLinks.length === 0 && (
        <EmptyState
          icon={<QrIcon />}
          title="Nema aktivnih linkova"
          text="Kreiraj link iznad da bi podelio plan sa saputnicima."
        />
      )}

      {activeLinks.length > 0 && (
        <ul className="item-list">
          {activeLinks.map((link) => (
            <li key={link.token} className="share-link-card">
              <div className="share-link-card__qr">
                <QRCodeSVG value={shareUrl(link.token)} size={124} bgColor="#ffffff" fgColor="#0f172a" />
              </div>

              <div className="share-link-card__body">
                <div className="row">
                  <span className={`badge ${link.accessType === "Edit" ? "badge-warning" : "badge-info"}`}>
                    {link.accessType === "Edit" ? <PencilIcon /> : <EyeIcon />}
                    {accessTypeLabels[link.accessType]}
                  </span>
                  <span className="text-sm text-muted">ističe {formatDateTime(link.expiresAt)}</span>
                </div>

                <code className="share-link-card__url">{shareUrl(link.token)}</code>

                <div className="row">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleCopy(link.token)}>
                    <CopyIcon />
                    {copiedToken === link.token ? "Kopirano!" : "Kopiraj link"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-soft btn-sm"
                    onClick={() => handleRevoke(link.token)}
                  >
                    <TrashIcon />
                    Opozovi
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
