"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useTransition } from "react";

export type VolunteerRow = {
  id: string;
  name: string;
  email: string;
  skills: string[];
  causes: string[];
  approved: boolean;
  lastProposalAt?: string | null;
};

export type AssociationRow = {
  id: string;
  orgName: string;
  email: string;
  website?: string | null;
  approved: boolean;
};

export type OpportunityRow = {
  id: string;
  title: string;
  association: string;
  modality: string;
  urgency: number;
  active: boolean;
};

export type MatchRow = {
  id: string;
  volunteer: string;
  opportunity: string;
  status: string;
  score: number;
};

async function toggleApproval(
  id: string,
  type: "volunteer" | "association",
  approved: boolean,
) {
  const res = await fetch("/api/admin/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, type, approved }),
  });
  if (!res.ok) throw new Error("Failed to update");
}

export function VolunteersTable({ rows }: { rows: VolunteerRow[] }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="rounded-2xl border border-white/60 bg-white/95 p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Skills</TableHead>
            <TableHead>Causes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="font-medium">{row.name}</div>
                <p className="text-ink/60 text-sm">{row.email}</p>
              </TableCell>
              <TableCell>{row.skills.join(", ") || "—"}</TableCell>
              <TableCell>{row.causes.join(", ") || "—"}</TableCell>
              <TableCell>
                <Badge variant={row.approved ? "default" : "outline"}>
                  {row.approved ? "Approved" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        await toggleApproval(
                          row.id,
                          "volunteer",
                          !row.approved,
                        );
                        toast.success("Volunteer updated");
                      } catch (error) {
                        console.error(error);
                        toast.error("Update failed");
                      }
                    })
                  }
                >
                  {row.approved ? "Revoke" : "Approve"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function AssociationsTable({ rows }: { rows: AssociationRow[] }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="rounded-2xl border border-white/60 bg-white/95 p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="font-medium">{row.orgName}</div>
                <p className="text-ink/60 text-sm">{row.email}</p>
              </TableCell>
              <TableCell>
                {row.website ? (
                  <a
                    href={row.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal underline"
                  >
                    {row.website}
                  </a>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <Badge variant={row.approved ? "default" : "outline"}>
                  {row.approved ? "Approved" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        await toggleApproval(
                          row.id,
                          "association",
                          !row.approved,
                        );
                        toast.success("Association updated");
                      } catch (error) {
                        console.error(error);
                        toast.error("Update failed");
                      }
                    })
                  }
                >
                  {row.approved ? "Revoke" : "Approve"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function OpportunitiesTable({ rows }: { rows: OpportunityRow[] }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/95 p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Association</TableHead>
            <TableHead>Modality</TableHead>
            <TableHead>Urgency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.title}</TableCell>
              <TableCell>{row.association}</TableCell>
              <TableCell>{row.modality}</TableCell>
              <TableCell>
                <Badge variant={row.urgency > 7 ? "destructive" : "secondary"}>
                  {row.urgency}/10
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function MatchesBoard({ rows }: { rows: MatchRow[] }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/95 p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Volunteer</TableHead>
            <TableHead>Opportunity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.volunteer}</TableCell>
              <TableCell>{row.opportunity}</TableCell>
              <TableCell>
                <Badge>{row.status}</Badge>
              </TableCell>
              <TableCell>{row.score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
