
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const KnowledgeBase: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Base</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium">Common Issues</h4>
            <div className="space-y-2 text-sm">
              <div className="p-2 border rounded hover:bg-muted/50 cursor-pointer">
                Internet connection troubleshooting
              </div>
              <div className="p-2 border rounded hover:bg-muted/50 cursor-pointer">
                Router configuration guide
              </div>
              <div className="p-2 border rounded hover:bg-muted/50 cursor-pointer">
                Billing and payment procedures
              </div>
              <div className="p-2 border rounded hover:bg-muted/50 cursor-pointer">
                Equipment installation guide
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Contact Information</h4>
            <div className="space-y-2 text-sm">
              <div className="p-2 border rounded">
                <div className="font-medium">Technical Support</div>
                <div className="text-muted-foreground">+254-700-123-456</div>
                <div className="text-muted-foreground">tech@kisumunet.co.ke</div>
              </div>
              <div className="p-2 border rounded">
                <div className="font-medium">Billing Support</div>
                <div className="text-muted-foreground">+254-700-123-457</div>
                <div className="text-muted-foreground">billing@kisumunet.co.ke</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KnowledgeBase;
