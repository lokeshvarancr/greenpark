import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./card";
import { Button } from "./Button";

export function CardExample() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Blue Themed Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-700 dark:text-blue-300">This card uses the global blue theme.</p>
      </CardContent>
      <CardFooter>
        <Button>Primary Action</Button>
        <Button variant="secondary" className="ml-2">Secondary</Button>
      </CardFooter>
    </Card>
  );
}
