import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { projectService } from "@/lib/services/project";

interface ProjectData {
  title: string;
  description: string;
  status: "active" | "on_hold" | "completed" | "cancelled";
  budget: {
    total: string;
    actuals: string;
    forecast: string;
  };
  charterLink: string;
  sponsors: string;
  businessLeads: string;
  projectManager: string;
  accomplishments: string[];
  nextPeriodActivities: string[];
  milestones: Array<{
    date: string;
    milestone: string;
    owner: string;
    completion: number;
    status: "green" | "yellow" | "red";
  }>;
  risks: string[];
  considerations: string[];
}

interface ProjectFormProps {
  initialData?: ProjectData;
  onSubmit: (data: ProjectData) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSubmit }) => {
  const formatCurrency = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, "");
    const numValue = parseFloat(cleanValue);

    if (!isNaN(numValue)) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
        .format(numValue)
        .replace("$", "");
    }
    return "0.00";
  };

  const [formData, setFormData] = React.useState<ProjectData>(
    initialData || {
      title: "",
      description: "",
      status: "active",
      budget: {
        total: formatCurrency("0"),
        actuals: formatCurrency("0"),
        forecast: formatCurrency("0"),
      },
      charterLink: "",
      sponsors: "",
      businessLeads: "",
      projectManager: "",
      accomplishments: [""],
      nextPeriodActivities: [""],
      milestones: [
        { date: "", milestone: "", owner: "", completion: 0, status: "green" },
      ],
      risks: [""],
      considerations: [""],
    },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="p-6 bg-card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-end">
          <Button type="submit" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {initialData ? "Save Changes" : "Create Project"}
          </Button>
        </div>
        <div className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label className="text-blue-800">Project Title</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label className="text-blue-800">Project Description</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter a brief description of the project"
              />
            </div>

            <div>
              <Label className="text-blue-800">Project Status</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as typeof formData.status,
                  })
                }
              >
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-blue-800">Total Budget</Label>
              <Input
                type="text"
                placeholder="0.00"
                value={formData.budget.total}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: { ...formData.budget, total: e.target.value },
                  })
                }
                onBlur={(e) =>
                  setFormData({
                    ...formData,
                    budget: {
                      ...formData.budget,
                      total: formatCurrency(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-blue-800">Actuals</Label>
              <Input
                type="text"
                placeholder="0.00"
                value={formData.budget.actuals}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: { ...formData.budget, actuals: e.target.value },
                  })
                }
                onBlur={(e) =>
                  setFormData({
                    ...formData,
                    budget: {
                      ...formData.budget,
                      actuals: formatCurrency(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-blue-800">Forecast</Label>
              <Input
                type="text"
                placeholder="0.00"
                value={formData.budget.forecast}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: { ...formData.budget, forecast: e.target.value },
                  })
                }
                onBlur={(e) =>
                  setFormData({
                    ...formData,
                    budget: {
                      ...formData.budget,
                      forecast: formatCurrency(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label className="text-blue-800">Project Charter Link</Label>
            <Input
              type="url"
              value={formData.charterLink}
              onChange={(e) =>
                setFormData({ ...formData, charterLink: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          <div>
            <Label className="text-blue-800">Sponsors</Label>
            <Input
              value={formData.sponsors}
              onChange={(e) =>
                setFormData({ ...formData, sponsors: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label className="text-blue-800">Business Lead(s)</Label>
            <Input
              value={formData.businessLeads}
              onChange={(e) =>
                setFormData({ ...formData, businessLeads: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label className="text-blue-800">Project Manager</Label>
            <Input
              value={formData.projectManager}
              onChange={(e) =>
                setFormData({ ...formData, projectManager: e.target.value })
              }
              required
            />
          </div>

          {/* Milestones */}
          <div className="space-y-2">
            <Label className="text-blue-800 text-lg">Milestones</Label>
            {formData.milestones.map((milestone, index) => (
              <div key={index} className="grid grid-cols-4 gap-2">
                <Input
                  placeholder="Date"
                  type="date"
                  value={milestone.date}
                  onChange={(e) => {
                    const newMilestones = [...formData.milestones];
                    newMilestones[index].date = e.target.value;
                    setFormData({ ...formData, milestones: newMilestones });
                  }}
                />
                <Input
                  placeholder="Milestone"
                  value={milestone.milestone}
                  onChange={(e) => {
                    const newMilestones = [...formData.milestones];
                    newMilestones[index].milestone = e.target.value;
                    setFormData({ ...formData, milestones: newMilestones });
                  }}
                />
                <Input
                  placeholder="Owner"
                  value={milestone.owner}
                  onChange={(e) => {
                    const newMilestones = [...formData.milestones];
                    newMilestones[index].owner = e.target.value;
                    setFormData({ ...formData, milestones: newMilestones });
                  }}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Completion %"
                    type="number"
                    min="0"
                    max="100"
                    value={milestone.completion}
                    onChange={(e) => {
                      const newMilestones = [...formData.milestones];
                      newMilestones[index].completion = Number(e.target.value);
                      setFormData({ ...formData, milestones: newMilestones });
                    }}
                    className="w-24"
                  />
                  <select
                    value={milestone.status}
                    onChange={(e) => {
                      const newMilestones = [...formData.milestones];
                      newMilestones[index].status = e.target.value as
                        | "green"
                        | "yellow"
                        | "red";
                      setFormData({ ...formData, milestones: newMilestones });
                    }}
                    className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="green">On Track</option>
                    <option value="yellow">At Risk</option>
                    <option value="red">Behind</option>
                  </select>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({
                  ...formData,
                  milestones: [
                    ...formData.milestones,
                    {
                      date: "",
                      milestone: "",
                      owner: "",
                      completion: 0,
                      status: "green",
                    },
                  ],
                })
              }
            >
              Add Milestone
            </Button>
          </div>

          {/* Accomplishments */}
          <div className="space-y-2">
            <Label className="text-blue-800 text-lg">Accomplishments</Label>
            {formData.accomplishments.map((accomplishment, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={accomplishment}
                  onChange={(e) => {
                    const newAccomplishments = [...formData.accomplishments];
                    newAccomplishments[index] = e.target.value;
                    setFormData({
                      ...formData,
                      accomplishments: newAccomplishments,
                    });
                  }}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({
                  ...formData,
                  accomplishments: [...formData.accomplishments, ""],
                })
              }
            >
              Add Accomplishment
            </Button>
          </div>

          {/* Next Period's Activities */}
          <div className="space-y-2">
            <Label className="text-blue-800 text-lg">
              Next Period's Activities
            </Label>
            {formData.nextPeriodActivities.map((activity, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={activity}
                  onChange={(e) => {
                    const newActivities = [...formData.nextPeriodActivities];
                    newActivities[index] = e.target.value;
                    setFormData({
                      ...formData,
                      nextPeriodActivities: newActivities,
                    });
                  }}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({
                  ...formData,
                  nextPeriodActivities: [...formData.nextPeriodActivities, ""],
                })
              }
            >
              Add Activity
            </Button>
          </div>

          {/* Risks */}
          <div className="space-y-2">
            <Label className="text-blue-800 text-lg">Risks and Issues</Label>
            {formData.risks.map((risk, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={risk}
                  onChange={(e) => {
                    const newRisks = [...formData.risks];
                    newRisks[index] = e.target.value;
                    setFormData({ ...formData, risks: newRisks });
                  }}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({
                  ...formData,
                  risks: [...formData.risks, ""],
                })
              }
            >
              Add Risk
            </Button>
          </div>

          {/* Considerations */}
          <div className="space-y-2">
            <Label className="text-blue-800 text-lg">
              Questions / Items for Consideration
            </Label>
            {formData.considerations.map((consideration, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={consideration}
                  onChange={(e) => {
                    const newConsiderations = [...formData.considerations];
                    newConsiderations[index] = e.target.value;
                    setFormData({
                      ...formData,
                      considerations: newConsiderations,
                    });
                  }}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({
                  ...formData,
                  considerations: [...formData.considerations, ""],
                })
              }
            >
              Add Consideration
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {initialData ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProjectForm;
