'use client';

import React, { useState } from 'react';
import { Button, Input, Card, CardBody, CardHeader, CardFooter, Badge, Modal } from '../../components/ui';
import { useUIStore } from '../../lib/stores/uiStore';

export default function DemoPage() {
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useUIStore();

  const handleShowToast = (type: 'success' | 'error' | 'info' | 'warning') => {
    addToast({
      message: `This is a ${type} toast message!`,
      type,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 text-gradient">Component Library</h1>
        <p className="text-lg text-neutral-600 mb-12">Phase 2: Design System & Base Components</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Buttons Section */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Buttons</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="primary" size="sm">
                Small Button
              </Button>
              <Button variant="primary" size="lg">
                Large Button
              </Button>
              <Button variant="primary" isLoading>
                Loading Button
              </Button>
              <Button variant="primary" disabled>
                Disabled Button
              </Button>
            </CardBody>
          </Card>

          {/* Input Section */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Inputs</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+63 975 298 4845"
                success={email.length > 0}
              />
              <Input
                label="Invalid Field"
                type="text"
                placeholder="This field has an error"
                error="This field is required"
              />
              <Input
                label="Disabled Field"
                type="text"
                placeholder="You cannot type here"
                disabled
              />
            </CardBody>
          </Card>

          {/* Badges Section */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Badges</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="neutral">Neutral</Badge>
              </div>
            </CardBody>
          </Card>

          {/* Toast Section */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Toasts</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleShowToast('success')}
              >
                Show Success Toast
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleShowToast('error')}
              >
                Show Error Toast
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleShowToast('info')}
              >
                Show Info Toast
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleShowToast('warning')}
              >
                Show Warning Toast
              </Button>
            </CardBody>
          </Card>

          {/* Modal Section */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Modal</h2>
            </CardHeader>
            <CardBody>
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
              >
                Open Modal
              </Button>

              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Example Modal"
              >
                <p className="text-neutral-700 mb-6">
                  This is a modal dialog component. You can place any content inside it.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button variant="secondary">Save</Button>
                </div>
              </Modal>
            </CardBody>
          </Card>

          {/* Cards Section */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Cards</h2>
            </CardHeader>
            <CardBody>
              <Card hoverable shadow="md">
                <CardBody>
                  <h3 className="font-bold text-lg mb-2">Hoverable Card</h3>
                  <p className="text-neutral-600 text-sm">
                    This card has hover effects. Try hovering over it!
                  </p>
                </CardBody>
              </Card>
            </CardBody>
          </Card>
        </div>

        {/* Design Tokens Showcase */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Design Tokens</h2>

          {/* Colors */}
          <Card className="mb-8">
            <CardHeader>
              <h3 className="text-2xl font-bold">Colors</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
                  (shade) => (
                    <div key={shade} className="text-center">
                      <div
                        className={`w-full h-16 rounded-lg mb-2 bg-primary-${shade as any}`}
                      />
                      <p className="text-xs text-neutral-600">{shade}</p>
                    </div>
                  )
                )}
              </div>
            </CardBody>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <h3 className="text-2xl font-bold">Typography</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <h1 className="text-5xl font-bold">Heading 1</h1>
                <p className="text-neutral-600">Size: clamp(3rem, 2.55rem + 2.25vw, 3.75rem)</p>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Heading 2</h2>
                <p className="text-neutral-600">Size: clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem)</p>
              </div>
              <div>
                <p className="text-base">Body text - Regular</p>
                <p className="text-neutral-600">Font: Montserrat, size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem)</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Small text for captions</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
