
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Wifi, Zap } from 'lucide-react';
import { ServicePackage } from '@/hooks/useServicePackages';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PackageListProps {
  packages: ServicePackage[];
  onEdit: (pkg: ServicePackage) => void;
}

const PackageList: React.FC<PackageListProps> = ({ packages, onEdit }) => {
  const getConnectionTypeIcon = (type: string) => {
    switch (type) {
      case 'fiber':
        return <Zap className="h-3 w-3" />;
      case 'wireless':
        return <Wifi className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getConnectionTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'fiber':
        return 'bg-blue-100 text-blue-800';
      case 'wireless':
        return 'bg-green-100 text-green-800';
      case 'satellite':
        return 'bg-purple-100 text-purple-800';
      case 'dsl':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (packages.length === 0) {
    return (
      <div className="text-center py-8">
        <Wifi className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No packages configured</h3>
        <p className="text-muted-foreground">
          Create your first service package to get started
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Package Name</TableHead>
          <TableHead>Speed</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Connection Types</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {packages.map((pkg) => (
          <TableRow key={pkg.id}>
            <TableCell>
              <div>
                <div className="font-medium">{pkg.name}</div>
                {pkg.description && (
                  <div className="text-sm text-muted-foreground">
                    {pkg.description}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-yellow-500" />
                {pkg.speed}
              </div>
            </TableCell>
            <TableCell>
              <div className="font-medium">KES {pkg.monthly_rate.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {pkg.connection_types.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className={`${getConnectionTypeBadgeColor(type)} flex items-center gap-1`}
                  >
                    {getConnectionTypeIcon(type)}
                    {type}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={pkg.is_active ? "default" : "secondary"}>
                {pkg.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(pkg)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PackageList;
