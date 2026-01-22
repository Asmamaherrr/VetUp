"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateCoupon, applyCoupon } from "@/lib/actions/coupons"
import { useToast } from "@/hooks/use-toast"
import { Tag, Loader2, Check } from "lucide-react"

interface CouponInputProps {
  courseId: string
  onApply?: (discount: number) => void
}

export function CouponInput({ courseId, onApply }: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [discount, setDiscount] = useState<number | null>(null)
  const { toast } = useToast()

  async function handleValidate() {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const result = await validateCoupon(couponCode)

      if (!result.valid) {
        toast({
          title: "Invalid Coupon",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      const applied = await applyCoupon(courseId, couponCode)
      setDiscount(applied.discount)
      onApply?.(applied.discount)

      toast({
        title: "Coupon Applied",
        description: `${applied.discount}% discount applied!`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply coupon",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (discount !== null) {
    return (
      <Alert className="border-success/50 bg-success/10">
        <Check className="h-4 w-4 text-success" />
        <AlertDescription>
          <div className="font-medium text-success">{discount}% Discount Applied</div>
          <div className="text-sm text-success/80 mt-1">Coupon code: {couponCode}</div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Have a coupon code?</label>
      <div className="flex gap-2">
        <Input
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          disabled={isLoading}
        />
        <Button onClick={handleValidate} disabled={isLoading} variant="outline" className="gap-2 px-3 bg-transparent">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Tag className="h-4 w-4" />
              Apply
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
