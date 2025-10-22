import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const realEmployees = [
  { name: "Alex Oswaldo Castaneda Molina", phone: "786-776-7872", hourly_wage: 20.0 },
  { name: "Alexy Edgardo Antunez Chinchilla", phone: "305-323-0874", hourly_wage: 20.0 },
  { name: "Alian Naranjo Ramirez", phone: "305-930-5046", hourly_wage: 20.0 },
  { name: "Andres Acosta Acosta", phone: "786-865-5800", hourly_wage: 20.0 },
  { name: "Angelo Rayo Torrez", phone: "786-407-3725", hourly_wage: 20.0 },
  { name: "Bayron Josue Maldonado Carcamo", phone: "786-671-9968", hourly_wage: 20.0 },
  { name: "Darwin Noe Castro Cruz", phone: "256-691-8652", hourly_wage: 20.0 },
  { name: "Erick Martinez", phone: "786-366-2976", hourly_wage: 20.0 },
  { name: "Jose Alonso Diaz Martinez", phone: "786-958-3797", hourly_wage: 20.0 },
  { name: "Jose Gregorio Mundarain", phone: "786-426-6497", hourly_wage: 20.0 },
  { name: "Jose Manuel Diaz Contreras", phone: "786-524-8808", hourly_wage: 20.0 },
  { name: "Jose Roberto Meneses Jiron", phone: "786-370-4027", hourly_wage: 20.0 },
  { name: "Mario Melendez", phone: "786-597-4007", hourly_wage: 20.0 },
  { name: "Miguel Angel Miranda", phone: "786-444-5079", hourly_wage: 20.0 },
  { name: "Luis Diego Ruiz Sanchez", phone: "770-902-2734", hourly_wage: 20.0 },
  { name: "Oswaldo L. Muñoz", phone: "", hourly_wage: 20.0 },
  { name: "Raul Diaz Morel", phone: "786-445-4042", hourly_wage: 20.0 },
  { name: "Roberto Carranza Carranza", phone: "786-303-9176", hourly_wage: 20.0 },
  { name: "Santos Jimenez", phone: "", hourly_wage: 20.0 },
  { name: "Wilder Quiñones Matos", phone: "856-882-0985", hourly_wage: 20.0 },
  { name: "Winston A. Baldelomar Alegria", phone: "786-564-6014", hourly_wage: 20.0 },
  { name: "Wiston Bermudez", phone: "", hourly_wage: 20.0 },
  { name: "Yader Antonio Mejias", phone: "786-203-7105", hourly_wage: 20.0 },
  { name: "Yunior Alexander Diaz Castro", phone: "", hourly_wage: 20.0 },
  { name: "Yusmanys Beritan Espinoza", phone: "561-480-0112", hourly_wage: 20.0 },
  { name: "Alexis Antonio", phone: "", hourly_wage: 20.0 },
  { name: "Bayron Enrique Rosales Cruz", phone: "786-4451963", hourly_wage: 20.0 },
  { name: "Carlos Arnulfo Hernandez Flores", phone: "309-9731486", hourly_wage: 20.0 },
  { name: "Esteban Zamora", phone: "", hourly_wage: 20.0 },
  { name: "Georvis de la Torre Sanchez", phone: "754-284-9219", hourly_wage: 20.0 },
  { name: "Kevin Edgardo Hernandez Flores", phone: "847-7662484", hourly_wage: 20.0 },
  { name: "Wiston Bermudez", phone: "305-391-7779", hourly_wage: 20.0 },
  { name: "Yeison C. Bermudez", phone: "", hourly_wage: 20.0 },
  { name: "Bayardo V. Obregon Urbina", phone: "786-704-2233", hourly_wage: 20.0 },
  { name: "Brayan Antonio Urroz Saravia", phone: "786-828-3203", hourly_wage: 20.0 },
  { name: "Carlos Arturo Campo", phone: "786-382-3711", hourly_wage: 20.0 },
  { name: "Cairo Danilo Toruno Pineda", phone: "786-754-0759", hourly_wage: 20.0 },
  { name: "Dafri Eduardo Chavarria Lopez", phone: "480-430-5682", hourly_wage: 20.0 },
  { name: "Dorvin Armando Reyes Cruz", phone: "786-914-9636", hourly_wage: 20.0 },
  { name: "Edgar Alberto Trejo Andrade", phone: "786-486-7915", hourly_wage: 20.0 },
  { name: "Eduin Jose Baca Canales", phone: "815-372-8776", hourly_wage: 20.0 },
  { name: "Elmer Antonio Sanchez Martinez", phone: "305-793-3531", hourly_wage: 20.0 },
  { name: "Fernando Javier Sagastume Urquia", phone: "305-384-0236", hourly_wage: 20.0 },
  { name: "Gilberto Oval", phone: "786-390-8634", hourly_wage: 20.0 },
  { name: "Jesus Antonio Cubias Sanchez", phone: "239-645-3126", hourly_wage: 20.0 },
  { name: "Jonhson A. Ascanio Monsalve", phone: "786-762-5794", hourly_wage: 20.0 },
  { name: "Jose Antonio Gomez", phone: "669-239-1867", hourly_wage: 20.0 },
  { name: "Mario Jose Guzman", phone: "864-247-1585", hourly_wage: 20.0 },
  { name: "Marvin Gabriel Estrada Maradiaga", phone: "605-920-3200", hourly_wage: 20.0 },
  { name: "Marvin Noe Mencias Chirinos", phone: "786-641-4251", hourly_wage: 20.0 },
  { name: "Norlan Antonio Muñoz Gaitan", phone: "786-635-2585", hourly_wage: 20.0 },
  { name: "Osmar Lagos Tercero", phone: "305-766-8125", hourly_wage: 20.0 },
  { name: "Osmen Eli Medrano Medrano", phone: "305-413-6343", hourly_wage: 20.0 },
  { name: "Ronal Alexander Marroquin Sanchez", phone: "", hourly_wage: 20.0 },
  { name: "Rony Alberto Ruiz Escobar", phone: "786-764-2092", hourly_wage: 20.0 },
  { name: "Rudys Moises Lopez Quiroz", phone: "786-447-1262", hourly_wage: 20.0 },
  { name: "Aniel Youyoute", phone: "786-725-1931", hourly_wage: 20.0 },
  { name: "Edixon Sanchez", phone: "754-299-8710", hourly_wage: 20.0 },
  { name: "Esteban Garcia Campos", phone: "305-975-9827", hourly_wage: 20.0 },
  { name: "Evener Ruiz", phone: "786-762-6809", hourly_wage: 20.0 },
  { name: "Gerardo Lino Guillen Tarrero", phone: "786-778-9448", hourly_wage: 20.0 },
  { name: "Herminio Rodriguez Cifuentes", phone: "786-356-1205", hourly_wage: 20.0 },
  { name: "Jose Alexander Saavedra", phone: "786-794-8911", hourly_wage: 20.0 },
  { name: "Jose Carlos Ortiz Hernandez", phone: "786-374-5830", hourly_wage: 20.0 },
  { name: "Jose Luis Perez Antunez", phone: "305-481-7765", hourly_wage: 20.0 },
  { name: "Manuel D. Mendez Sanchez", phone: "786-938-4380", hourly_wage: 20.0 },
  { name: "Manuel de Jesus Mendez Matamoros", phone: "786-754-0757", hourly_wage: 20.0 },
  { name: "Marco Tulio Galicia Ramos", phone: "786-300-6752", hourly_wage: 20.0 },
  { name: "Marcos Felipe Ramos Disla", phone: "786-598-9719", hourly_wage: 20.0 },
  { name: "Nestor Xavier Palacios Duarte", phone: "786-304-5572", hourly_wage: 20.0 },
  { name: "Orlando de Jesus Oviedo Alvarado", phone: "786-537-7422", hourly_wage: 20.0 },
  { name: "Osmin Neptali Ortiz Funes", phone: "786-380-5026", hourly_wage: 20.0 },
  { name: "Raul Carmona Delgado", phone: "305-834-1963", hourly_wage: 20.0 },
  { name: "William Jose Ruiz Castro", phone: "786-762-6809", hourly_wage: 20.0 },
  { name: "Yoandy Lantigua Lopez", phone: "786-602-7704", hourly_wage: 20.0 },
  { name: "Yosnier Peraza Gonzalez", phone: "786-809-7071", hourly_wage: 20.0 },
  { name: "Antonio Jose Canelones Omana", phone: "786-627-3911", hourly_wage: 20.0 },
  { name: "Cesar Amady Geoson Mejia", phone: "786-826-4334", hourly_wage: 20.0 },
  { name: "Cesar Berardo Trochez", phone: "786-260-1995", hourly_wage: 20.0 },
  { name: "Eslier Mauricio Martinez Jimenez", phone: "786-355-5429", hourly_wage: 20.0 },
  { name: "Franklin David Guerrero Berroa", phone: "305-522-3813", hourly_wage: 20.0 },
  { name: "Jose Gabriel Novoa Osorio", phone: "928-287-4788", hourly_wage: 20.0 },
  { name: "Josue Nahum Calix Montenegro", phone: "786-378-3914", hourly_wage: 20.0 },
  { name: "Josue Osmin Rodriguez Caballero", phone: "786-531-8947", hourly_wage: 20.0 },
  { name: "Kedyn D. Rivera Ramos", phone: "786-803-6465", hourly_wage: 20.0 },
  { name: "Olban Joel Cruz Ventura", phone: "786-424-9219", hourly_wage: 20.0 },
  { name: "Oscar Danilo Rivas Quiroz", phone: "253-881-9771", hourly_wage: 20.0 },
  { name: "Wilmer Marcelino de Jesus Ramirez", phone: "786-914-0697", hourly_wage: 20.0 },
  { name: "David Ros Cardona", phone: "561-401-5486", hourly_wage: 20.0 },
  { name: "Efrain de Jesús Gomez Diaz", phone: "305-775-2453", hourly_wage: 20.0 },
  { name: "Esteban Alexander Ros Galdamez", phone: "561-262-1811", hourly_wage: 20.0 },
  { name: "Fredy Victor Quiñones Diaz", phone: "561-941-1442", hourly_wage: 20.0 },
  { name: "Jaime Victor Adrian Quiñones Diaz", phone: "561-805-0083", hourly_wage: 20.0 },
  { name: "Newton Miguel Garcia", phone: "786-419-3473", hourly_wage: 20.0 },
  { name: "Jose Alirio Turcios Cruz", phone: "786-712-6158", hourly_wage: 20.0 },
  { name: "Nery David Apen Cortez", phone: "786-340-3567", hourly_wage: 20.0 },
  { name: "Reynier Colas Puente", phone: "754-275-2843", hourly_wage: 20.0 },
  { name: "Aurelio Rufino Rangel", phone: "305-684-7069", hourly_wage: 20.0 },
  { name: "Wilfredo Reyes", phone: "786-420-7908", hourly_wage: 20.0 },
  { name: "Dilmer Adelson Ortiz Lopez", phone: "786-873-8876", hourly_wage: 20.0 },
  { name: "Edgar Leonel Guaran", phone: "508-840-1029", hourly_wage: 20.0 },
  { name: "Alex Gabriel Mencias", phone: "954-270-9252", hourly_wage: 20.0 },
  { name: "Carlos Enrique Rosales Almendares", phone: "786-873-8876", hourly_wage: 20.0 },
  { name: "Criss Hernandez", phone: "", hourly_wage: 20.0 },
  { name: "Manuel Zapata", phone: "786-454-6656", hourly_wage: 20.0 },
  { name: "Omar Acevedo", phone: "", hourly_wage: 20.0 },
  { name: "Oscar David Aguillon Juarez", phone: "305-586-4703", hourly_wage: 20.0 },
  { name: "Oscar Giovanni Rosales Antunez", phone: "786-576-8614", hourly_wage: 20.0 },
  { name: "Oswaldo Javier Mendoza Salas", phone: "254-319-5831", hourly_wage: 20.0 },
  { name: "Pedro Esteban Montero", phone: "", hourly_wage: 20.0 },
  { name: "Byron Apen Cortez", phone: "239-265-0556", hourly_wage: 20.0 },
  { name: "Jacob Bedoya", phone: "786-304-4364", hourly_wage: 20.0 },
  { name: "Javier Alejandro Gonzalez", phone: "786-346-7729", hourly_wage: 20.0 },
  { name: "Jesus Martinez", phone: "787-974-3894", hourly_wage: 20.0 },
  { name: "Josue Israel Rodriguez Euceda", phone: "305-781-2813", hourly_wage: 20.0 },
  { name: "Ramon Enrique Bastidas Vielma", phone: "786-603-8021", hourly_wage: 20.0 },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "check") {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      const { count, error } = await supabase.from("employees").select("*", { count: "exact", head: true })

      if (error) {
        return NextResponse.json({ success: false, error: error.message })
      }

      return NextResponse.json({ success: true, count })
    }

    return NextResponse.json({ success: false, error: "Invalid action" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "fix") {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Delete all existing employees
      const { error: deleteError, count: deletedCount } = await supabase.from("employees").delete().neq("id", 0) // Delete all rows

      if (deleteError) {
        return NextResponse.json({ success: false, error: `Delete failed: ${deleteError.message}` })
      }

      // Insert all 115 real employees with employee numbers starting from 1001
      const employeesToInsert = realEmployees.map((emp, index) => ({
        employee_number: (1001 + index).toString(),
        name: emp.name,
        phone: emp.phone || null,
        email: null,
        role: "worker",
        hourly_wage: emp.hourly_wage,
        pin_hash: "$2a$10$rQYz8vZ8Z8Z8Z8Z8Z8Z8ZuKx8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8", // Will be set properly via set_employee_pin
        must_change_pin: true,
        is_active: true,
      }))

      const { error: insertError, count: insertedCount } = await supabase
        .from("employees")
        .insert(employeesToInsert)
        .select()

      if (insertError) {
        return NextResponse.json({ success: false, error: `Insert failed: ${insertError.message}` })
      }

      return NextResponse.json({
        success: true,
        deleted: deletedCount || 0,
        inserted: employeesToInsert.length,
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
