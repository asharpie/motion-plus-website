//measured circumferences of prosthetic and real leg
Cp = 110; //circumference of lower prosthetic cylinder
Cs = 270; //circumference of biological soleus
Cg = 415; //circumference of biological gastrocnemius
Ct = 357; //circumference of top of biological calf under knee

//Conversion to diameters for parameterization
Dp = Cp/PI;
Ds = Cs/PI;
Dg = Cg/PI;
Dt = Ct/PI;

//Other measurements
Hg = 300; //Height from ankle to widest part of calf
Hp = 187.5; //Height from ankle to top of lower prosthetic cylinder
Hk = 55; //Distance the knee needs to be able to bend
Wp = 71; //Maximum width of the chunky part of the prosthetic (used to stop rotation)
Wk = 85; //Maximum width needed when the knee is bent in back portion
Lp = 400; // Total length of prosthetic leg from ankle to knee

//for cylinder that houses chunky portion of prosthetic leg
inner_cylinder_radius = (Dt+Wp)/4;

//for pins that slot the two pieces together
pin_slot_radius = (Dt/2 - inner_cylinder_radius) * 0.5;

//ankle slimness (scaler <=1)
ankleSlim = 0.65; // short part scale percent
ankleSlim2 = 0.9; // long part scale percent (front and back)


//Choose resolution for all parts
fn = 400;



//rotate_extrude($fn = fn) polygon(points=a);

module fillet_a() {
    difference()
    {
        translate([0,0,Hg])
            sphere(d = Dg, $fn = fn);
        translate([0,0,Hg])
            cylinder(r = inner_cylinder_radius, h = Lp - Hp, center = true, $fn = fn);
        translate([-500,0,0])
            cube([1000,1000,Hg+1000]);
        translate([-Wk/2,-1000,Lp-Hk])
            cube([Wk,1000,1000]);
    }
}

module fillet_b() {
     difference()
    {
        translate([0,0,Hg])
            sphere(d = Dg, $fn = fn);
        translate([0,0,Hg])
            cylinder(r = inner_cylinder_radius, h = Lp - Hp, center = true, $fn = fn);
        translate([-500,-1000,0])
            cube([1000,1000,Hg+1000]);
    }
}

module fillet_total() {
    fillet_a();
    fillet_b();
}

 a=[
 
 [0,0],
 [0.5*Ds, 0],
 [0.7*Ds, Hp], // top outer corner // JESSE LOOK AT THIS
 [0.5*Dg, Hg],
 [0.5*Dt, Lp],
 [0,Lp]
 

];
 
//rotate_extrude() rotate([90,0,0]) polygon(points=a);

module calf_original () {
   // intersection(){
    //    scale(
    difference()
    {
    rotate_extrude($fn = fn) polygon(points=a);
        union(){
            // bottom cut
            cylinder(d=Dp,h=Hp, $fn = fn);
            
            // large front cut
            translate([0,-Dg,-0.5*Hk+Lp])
                cube([Wk,2*Dg,Hk], center=true); //cut goes farther out than any point, 2*Dg
            
            // deep back cut
            translate([0,0.5*0.25*Dt,-0.5*(Lp-Hp)+Lp])
                cube([Wp, 0.25*Dt, Lp-Hp], center=true);
            
            //
            // cylinder from Hp up to Lp-Hk with radius inner_cylinder_radius

            translate([0,0, -(Lp-Hp)+Lp]) cylinder(r=inner_cylinder_radius, h=(Lp-Hp-Hk), $fn = fn);
            
            
    intersection() {
        translate([0,0.5*0.25*Dt,-0.5*(Lp-Hp)+Lp])
                   cube([Wp, 10*Dg, Lp-Hp], center=true);
        cylinder(r=inner_cylinder_radius, h=Lp, $fn = fn);
    };

        }
    }
    fillet_total();
}

module calf() {
    difference() {
        calf_original();
        translate([0,0,Hp/2]) cube([500, 500, Hp], center=true);
    }
    difference() {
    hull($fn = fn) {
        translate([0,0,Hp])cylinder(0.1,0.7*Ds, center=true);
        
        scale([ankleSlim,ankleSlim2,1]) cylinder(0.1,0.6*Ds, center=true);
    }
    translate([0,0,-1])
    cylinder(d=Dp,h = Hp + 2, $fn = fn);
    }

}


module pin(diam_modifier) {
    rotate([90,0,0]) translate([0,0,-13]) cylinder(h=26, r=diam_modifier*pin_slot_radius, $fn = fn);
}
module spokes(diam_modifier) { // modifier for holes = 1.0, pins = 0.97
        
    // mirror
    for(i=[-1,1]) {
        //lower set
       translate([i*( (0.5*Ds-0.5*Dp)*0.5 + 0.5*Dp ),0,(1.5/3)*Hp]) pin(diam_modifier);
           translate([i*( (0.5*Ds-0.5*Dp)*0.5 + 0.5*Dp ),0,(2.5/3)*Hp]) pin(diam_modifier);
        
        // upper set
        for (j=[-1,1]) {
            translate([i*(inner_cylinder_radius+((Dg*0.5)-inner_cylinder_radius)*0.5), 0, Hg])
            translate([0,0,j*pin_slot_radius*2]) // move up or down for the pair
            pin(diam_modifier);
        }
       //translate([, , Hg + ]) pin(diam_modifier);
    }
    
    
       
}



module alpha() {
    //fillet_a();
    union() {
        difference(){
            calf();
            translate([0,250,0]) cube([5000,500,5000], center = true);
        }
        
        spokes(0.97);
        
    }
}

module beta() {
    
    difference() {
        union() {
            difference() {
            calf();
            translate([0,-250,0]) cube([5000,500,5000], center = true);
            
        } 
            //fillet_b();
        }
        spokes(1);
        
    }
}





module export() {
    alpha(); // back
    beta(); // front
}


//translate([0,-Dg,-0.5*Hk+Lp]) cube([Wk,2*Dg,Hk], center=true);


//rotate_extrude() {
  //  poly_a
    
  //  };
    
    
 
// functions for display
calf();
//export();
translate([-200,0,0]) alpha();
translate([200,0,0]) beta();