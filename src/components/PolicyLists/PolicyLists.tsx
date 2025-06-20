import { Button, ButtonDesign, ButtonDomRef, DynamicPage, IllustratedMessage, MessageBox, MessageBoxActions, MessageBoxTypes, ObjectStatus, Table, TableCell, TableColumn, TableDomRef, TableMode, TableRow, Text, Toolbar, ToolbarSpacer, Ui5CustomEvent, ValueState, Input, Icon } from "@ui5/webcomponents-react";
import { FunctionComponent, MouseEventHandler, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { PolicyList, PolicyListType, PolicyTypeFilter } from "../../pages/listSlice";
import "@ui5/webcomponents-fiori/dist/illustrations/NoData.js";
import "@ui5/webcomponents-fiori/dist/illustrations/ErrorScreen.js";
import { TableSelectionChangeEventDetail } from "@ui5/webcomponents/dist/Table";
import Filter from "../Filter/Filter";
import isEqual from 'lodash/isEqual';
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, Menu, MenuItem } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DownloadIcon from "@mui/icons-material/Download"; // Import the download icon
import BarChartIcon from "@mui/icons-material/BarChart"; // Import the bar chart icon

interface PolicyListsProps {
  policyLists: PolicyList[];
  onCreateClick: MouseEventHandler<ButtonDomRef>;
  onCreateDeleteClick: MouseEventHandler<ButtonDomRef>;
  onView: (item: PolicyList) => void;
  onUpdatePolicyList?: (updatedList: PolicyList, index: number) => void;
  onDeleteSelected: (selected: PolicyList[]) => void;
  onDeleteConfirmation: (deletedPolicyLists: PolicyList[]) => void;
  selectedIds?: string[];
  onSelectionChange: (selectedRows: string[]) => void;
  filterType: string;
  onFilterChange: (filter: PolicyTypeFilter) => void;
}

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PolicyLists: FunctionComponent<PolicyListsProps> = ({
  policyLists,
  onCreateClick,
  onCreateDeleteClick,
  onView,
  filterType,
  onFilterChange,
  onDeleteSelected,
  onDeleteConfirmation,
  onSelectionChange,
}: PolicyListsProps): ReactElement => {

  const { t } = useTranslation(); // Initialize the translation hook
  const [selected, setSelected] = useState<string[]>([]);
  const [showDeleteConfirmationDialog, setShowDeleteConfirmationDialog] = useState(false);
  const [selectedPolicyLists, setSelectedPolicyLists] = useState<PolicyList[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(''); // Add state for search query
  const [isChartDialogOpen, setIsChartDialogOpen] = useState(false);
  const [isRegionChartDialogOpen, setIsRegionChartDialogOpen] = useState(false);
  const [highlightedRows, setHighlightedRows] = useState<string[]>([]);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const navigate = useNavigate(); // Use navigate for routing
  const username = localStorage.getItem("username");

  
  const setPolicyListsState = (newPolicyLists: PolicyList[]) => {
    if (!isEqual(newPolicyLists, policyLists)) {
      setPolicyLists(newPolicyLists);
    }
  };
  const handleUpdatePolicyList = (updatedPolicy: PolicyList) => {
    const updatedPolicyLists = policyLists.map((policy) =>
      policy.id === updatedPolicy.id ? updatedPolicy : policy
    );
    setPolicyLists(updatedPolicyLists); // Update the state with the edited policy
  
    // Highlight the updated row
    setHighlightedRows((prev) => [...prev, updatedPolicy.id]);
  
    // Remove the highlight after 2 seconds (adjust duration as needed)
    setTimeout(() => {
      setHighlightedRows((prev) => prev.filter((id) => id !== updatedPolicy.id));
    }, 2000);
  };
  const handleSelectionChange = (event: Ui5CustomEvent<TableDomRef, TableSelectionChangeEventDetail>) => {
    const selectedRows = event.detail.selectedRows.map(row => row.id) as string[];
    setSelected(selectedRows);
    const selectedPolicyLists = policyLists.filter(policy => selectedRows.includes(policy.id));
      // Filter selected policies by username
    // const selectedPolicyLists = policyLists.filter(
    //   (policy) => selectedRows.includes(policy.id) && policy.username === username
    // );
    setSelectedPolicyLists(selectedPolicyLists); // Update the selected policies state
    onDeleteSelected(selectedPolicyLists);
    onSelectionChange(selectedRows);
  };

  const setPolicyLists = (newPolicyLists: PolicyList[]) => {
    if (!isEqual(newPolicyLists, policyLists)) {
      console.log('setPolicyLists:', newPolicyLists);
      setPolicyListsState(newPolicyLists);
    }
  };

  const handleDeleteConfirmation = () => {
    onDeleteConfirmation(selectedPolicyLists);
    
    setShowDeleteConfirmationDialog(false);
    const updatedPolicyLists = policyLists.filter(
      (policy) => !selectedPolicyLists.some((selected) => selected.id === policy.id)
      // (policy) => !selectedPolicyLists.some((selected) => selected.id === policy.id) && policy.username === username
    );
    setPolicyLists(updatedPolicyLists);
    setSelected([]);
    setSelectedPolicyLists([]);
  };

  const handleLocationClick = (policy: PolicyList) => {
    // Ensure the policy has an IP range before navigating
    if (policy.ranges) {
      navigate("/map", { state: { ipRange: policy.ranges } });
    } else {
      console.error("No IP range available for this policy.");
    }
  };

  const filteredPolicyLists = policyLists
  .filter(
    (policy) =>
      policy.username === username &&
      policy.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .sort((a, b) => {
    if (!sortConfig) return 0; // No sorting applied
    const { key, direction } = sortConfig;

    const aValue = a[key as keyof PolicyList];
    const bValue = b[key as keyof PolicyList];

    if (key === "createdAt" || key === "updatedAt") {
      const aDate = new Date(aValue as string);
      const bDate = new Date(bValue as string);
      return direction === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
    }

    if (key === "name") {
      const aName = aValue.toString().toLowerCase();
      const bName = bValue.toString().toLowerCase();
      return direction === "asc" ? aName.localeCompare(bName) : bName.localeCompare(aName);
    }

    return 0;
  });

 const handleSort = (key: string) => {
   setSortConfig((prev) => {
     if (prev?.key === key) {
       // Toggle direction if the same column is clicked
       return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
     }
     return { key, direction: "asc" }; // Default to ascending
   });
 };

  const handleChartClick = () => {
    setIsChartDialogOpen(true); // Open the chart dialog
  };

  const handleChartDialogClose = () => {
    setIsChartDialogOpen(false); // Close the chart dialog
  };

  const policyCounts = filteredPolicyLists.reduce(
    (acc, policy) => {
      // Ensure `policy.type` is defined and provide a default value
      const type = policy.type || "Unknown"; // Default to "Unknown" if `type` is undefined
      const typeKey: "Allow" | "Block" | "Restricted" | "Unknown" =
        type.charAt(0).toUpperCase() + type.slice(1) as "Allow" | "Block" | "Restricted" | "Unknown";
  
      acc[typeKey] = (acc[typeKey] || 0) + 1;
      return acc;
    },
    { Allow: 0, Block: 0, Restricted: 0, Unknown: 0 } // Include "Unknown" in the initial accumulator
  );
  const regionCounts = filteredPolicyLists.reduce((acc, policy) => {
    const region = policy.region || "Unknown"; // Default to "Unknown" if region is undefined
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const regionChartData = {
    labels: Object.keys(regionCounts), // Region names
    datasets: [
      {
        label: t("regionDistribution"), // Translated label
        data: Object.values(regionCounts), // Region counts
        backgroundColor: [
          "#4caf50", "#f44336", "#ff9800", "#2196f3", "#9c27b0", "#ffeb3b", "#795548",
        ], // Colors for regions
      },
    ],
  };
  const handleRegionChartClick = () => {
    setIsRegionChartDialogOpen(true); // Open the region chart dialog
  };

  const chartData = {
    labels: ["Allow", "Block", "Restricted"],
    datasets: [
      {
        label: t("policyDistribution"), // Translated label
        data: [policyCounts.Allow, policyCounts.Block, policyCounts.Restricted],
        backgroundColor: ["#4caf50", "#f44336", "#ff9800"], // Colors for Allow, Block, Restricted
      },
    ],
  };
  const handleExportCSV = () => {
    const csvData = filteredPolicyLists.map((policy) => ({
      Username: policy.username,
      Name: policy.name,
      Type: policy.type,
      ID: policy.id,
      CreatedAt: policy.createdAt,
      UpdatedAt: policy.updatedAt,
      Region: policy.region,
      Size: policy.size,
      Ranges: policy.ranges.join(", "), // Combine ranges into a single string
    }));

    const csv = Papa.unparse(csvData); // Convert data to CSV format
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "policies.csv"); // Trigger download
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.text(t("policyList.pdfTitle"), 10, 10);

    // Prepare table data
    const tableData = filteredPolicyLists.map((policy) => [
      policy.username,
      policy.name,
      policy.type,
      policy.id,
      policy.createdAt,
      policy.updatedAt,
      policy.region,
      policy.size,
      policy.ranges.join(", "), // Combine ranges into a single string
    ]);

    // Add table to PDF
    autoTable(doc, {
      head: [["Username", "Name", "Type", "ID", "Created At", "Updated At","Region", "Size", "Ranges"]],
      body: tableData,
    });

    // Save the PDF
    doc.save("policies.pdf");
  };


  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleExportClick = (event: React.MouseEvent<ButtonDomRef>) => {
    setAnchorEl(event.currentTarget); // Open the dropdown
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close the dropdown
  };
  const [chartAnchorEl, setChartAnchorEl] = useState<null | HTMLElement>(null);


  const handleChartMenuClose = () => {
    setChartAnchorEl(null); // Close the dropdown
  };

  const handleViewChart = () => {
    handleChartMenuClose();
    console.log("Viewing Chart");
  };

  const handleViewRegionChart = () => {
    handleChartMenuClose();
    console.log("Viewing Region Chart");
  };

  return (
    <DynamicPage headerContent={
      <Toolbar>
      <Text>{t("policyList.title", { count: filteredPolicyLists.length })}</Text> {/* Translated */}
      <ToolbarSpacer />
      <Button
        design={ButtonDesign.Transparent}
        icon="bar-chart" // Add chart icon
        onClick={handleChartClick} // Open chart dialog
        style={{ marginRight: "10px" }}
      >
        {t("policyList.viewChart")}
      </Button>
      <Button
        design={ButtonDesign.Transparent}
        icon="bar-chart" // Add chart icon
        onClick={handleRegionChartClick} // Open region chart dialog
        style={{ marginRight: "10px" }}
      >
        {t("policyList.viewRegionChart")} {/* Translated label for region chart */}
      </Button>
      <Filter selectedType={filterType} handleTypeChange={onFilterChange} />
      <Input
        placeholder={t("policyList.searchPlaceholder")} // Translated
        value={searchQuery}
        onInput={(event) => setSearchQuery(event.target.value)}
        style={{ marginRight: "20px" }}
      />
      <Button
        data-testid="create-delete-button"
        design="Transparent"
        onClick={onCreateClick}
      >
        {t("policyList.create")} {/* Translated */}
      </Button>
      <Button
        data-testid="delete-button"
        disabled={selected.length === 0}
        design={ButtonDesign.Emphasized}
        onClick={onCreateDeleteClick}
      >
        {t("policyList.delete")} {/* Translated */}
      </Button>
      <div>
      <Button
        design="Transparent"
        onClick={handleExportClick}
        style={{ marginRight: "10px" }}
        icon="download" // Use the icon prop with the appropriate icon name
      >
      {t("policyList.export")} {/* Translated */}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }} // Ensure the dropdown appears below the button
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }} // Align the dropdown properly
      >
        <MenuItem onClick={handleExportCSV}>Export as CSV</MenuItem>
        <MenuItem onClick={handleExportPDF}>Export as PDF</MenuItem>
      </Menu>
    </div>
    </Toolbar>
    }
    >
      <Dialog open={isChartDialogOpen} onClose={handleChartDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t("policyDistribution")}</DialogTitle>
        <DialogContent>
          <Bar data={chartData} />
        </DialogContent>
      </Dialog>
      <Dialog open={isRegionChartDialogOpen} onClose={() => setIsRegionChartDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("regionDistribution")}</DialogTitle>
        <DialogContent>
          <Bar data={regionChartData} />
        </DialogContent>
      </Dialog>
      <MessageBox
        type={MessageBoxTypes.Confirm}
        open={showDeleteConfirmationDialog}
        actions={[MessageBoxActions.Yes, MessageBoxActions.No]}
        onClose={(event) => {
          if (event.detail.action === MessageBoxActions.Yes) {
            handleDeleteConfirmation();
          }
          setShowDeleteConfirmationDialog(false);
        }}
      >
        {t("policyList.confirmDelete")} {/* Translated */}
      </MessageBox>
      {filteredPolicyLists.length === 0 && (
        <IllustratedMessage name="NoData" data-testid="policylist-nodata">
          {t("policyList.noPolicyLists")} {/* Translated */}
        </IllustratedMessage>
      )}      {filteredPolicyLists.length !== 0 && (
        <Table
          data-testid="policylist-table"
          noDataText={t("policyList.noPolicyLists")}         
           columns={
            <>
             <TableColumn minWidth={400}>
                <Text></Text>
              </TableColumn>
              <TableColumn minWidth={400} id={"name"} key={"name"}>
                <Text
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("name")}
                >
                  {t("policyList.name")}{" "}
                  {sortConfig?.key === "name" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </Text>
              </TableColumn>
              <TableColumn id={"type"} key={"type"}>
                <Text>{t("policyList.type")}</Text> {/* Translated */}
              </TableColumn>
              <TableColumn minWidth={400} id={"id"} key={"id"}>
                <Text>{t("policyList.id")}</Text> {/* Translated */}
              </TableColumn>
             <TableColumn minWidth={400} id={"createdAt"} key={"createdAt"}>
              <Text
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("createdAt")}
              >
                {t("policyList.createdAt")}{" "}
                {sortConfig?.key === "createdAt" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </Text>
            </TableColumn>
              {/* <TableColumn minWidth={400} id={"updatedAt"} key={"updatedAt"}> */}
                {/* <Text>{t("policyList.updatedAt")}</Text> Translated */}
              {/* </TableColumn> */}
              <TableColumn minWidth={400} id={"updatedAt"} key={"updatedAt"}>
              <Text
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("updatedAt")}
              >
                {t("policyList.updatedAt")}{" "}
                {sortConfig?.key === "updatedAt" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </Text>
            </TableColumn>
              <TableColumn minWidth={400} id={"size"} key={"size"}>
                <Text>{t("policyList.size")}</Text> {/* Translated */}
              </TableColumn>
             <TableColumn minWidth={400} id={"region"} key={"region"}>
                <Text>{t("policyList.region")}</Text> 
               </TableColumn> 
              <TableColumn minWidth={400} id={"location"} key={"location"}>
                <Text>{t("policyList.location")}</Text> {/* New Location Column */}
              </TableColumn>
            </>
          }
          mode={TableMode.MultiSelect}
          onSelectionChange={handleSelectionChange}
        >

          {filteredPolicyLists.map((item: PolicyList) => (
            <TableRow
              type="Active"
              key={item.id}
              id={item.id}
              data-testid={`policylist-row-${item.id}`}
              className={highlightedRows.includes(item.id) ? "row-highlight" : ""}
>
              <TableCell>
                <Button onClick={() => onView(item)}>{t("policyList.view")}</Button>
              </TableCell>
              <TableCell>
                <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
              </TableCell>
              <TableCell>
  <ObjectStatus
    state={
      item.type === PolicyListType.Block
        ? ValueState.Error
        : item.type === PolicyListType.restricted
        ? ValueState.Warning // Use Warning for orange
        : ValueState.Success
    }
    style={
      item.type === PolicyListType.restricted
        ? { color: "orange" } // Apply custom orange color
        : {}
    }
  >
    {t(`policyList.${item.type.toLowerCase()}`)} {/* Translated */}
  </ObjectStatus>
</TableCell>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.createdAt}</TableCell>
              <TableCell>{item.updatedAt}</TableCell>
              <TableCell>{item.size}</TableCell>
              <TableCell>{item.region || t("policyList.noRegion")}</TableCell> Display Region
              <TableCell>
              <Icon
                  name="globe" // Alternative icon name
                  interactive
                  style={{ cursor: "pointer", color: "blue" }}
                  onClick={() => handleLocationClick(item)} // Handle click to navigate to map
                />
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </DynamicPage>
  );

};

export default PolicyLists;